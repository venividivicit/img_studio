import { AppError, type ErrorCode } from "../lib/errors.ts";
import { config } from "../core/config.ts";
import type { JobRecord } from "../types/job.ts";
import * as blobStorage from "./blob_storage.ts";
import { jobRepository } from "../repositories/job_repository.ts";
import { processImage } from "./image_processor.ts";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png"]);

function extFromMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    default:
      return "bin";
  }
}

function failJob(jobId: string, code: ErrorCode, message: string): void {
  jobRepository.updateStatus(jobId, "failed", {
    errorCode: code,
    errorMessage: message,
    completedAt: new Date().toISOString(),
  });
}

export function listJobs(sessionId: string, limit: number = 10): JobRecord[] {
  return jobRepository.listBySession(sessionId, limit);
}

export function getJob(jobId: string, sessionId: string): JobRecord {
  const job = jobRepository.findByIdAndSession(jobId, sessionId);
  if (!job) {
    throw new AppError("JOB_NOT_FOUND", "Job not found.", 404);
  }
  return job;
}

export async function processJob(
  jobId: string,
  sessionId: string,
): Promise<void> {
  const job = getJob(jobId, sessionId);
  if (!job.original_r2_key) {
    failJob(jobId, "PROCESSING_FAILED", "Original image is missing.");
    return;
  }

  try {
    const sourceUrl = blobStorage.publicUrlForKey(job.original_r2_key);
    const processed = await processImage(sourceUrl);
    const processedKey = blobStorage.processedKey(sessionId, jobId);
    await blobStorage.putObject(processedKey, processed, "image/png");
    jobRepository.updateStatus(jobId, "completed", {
      processedR2Key: processedKey,
      completedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[processJob]", { jobId, error });
    failJob(
      jobId,
      "PROCESSING_FAILED",
      "Could not process image. Please try again.",
    );
  }
}

export async function createJobFromUpload(
  sessionId: string,
  file: File,
): Promise<JobRecord> {
  if (!file || file.size === 0) {
    throw new AppError("FILE_REQUIRED", "Image file is required.", 400);
  }

  if (file.size > config.maxUploadBytes) {
    throw new AppError(
      "FILE_TOO_LARGE",
      `Image must be ${config.maxUploadBytes} bytes or smaller.`,
      413,
    );
  }

  const mime = file.type || "application/octet-stream";
  if (!ALLOWED_MIME.has(mime)) {
    throw new AppError(
      "UNSUPPORTED_TYPE",
      "Only JPEG, PNG, and WebP images are supported.",
      415,
    );
  }

  const jobId = crypto.randomUUID();
  const ext = extFromMime(mime);
  const key = blobStorage.originalKey(sessionId, jobId, ext);
  const buffer = new Uint8Array(await file.arrayBuffer());

  jobRepository.insert({
    id: jobId,
    sessionId,
    originalFilename: file.name,
    originalMime: mime,
    originalBytes: file.size,
    originalR2Key: key,
  });

  try {
    await blobStorage.putObject(key, buffer, mime);
  } catch (error) {
    jobRepository.deleteById(jobId);
    console.error("[r2] upload failed", { jobId, error });
    throw new AppError(
      "INTERNAL_ERROR",
      "Failed to store image. Please try again.",
      500,
    );
  }

  return getJob(jobId, sessionId);
}

export async function deleteJob(
  jobId: string,
  sessionId: string,
): Promise<void> {
  const job = getJob(jobId, sessionId);
  if (!job) {
    throw new AppError("JOB_NOT_FOUND", "Job not found.", 404);
  }
  const keys = [job.original_r2_key, job.processed_r2_key].filter(
    (k): k is string => Boolean(k),
  );

  for (const key of keys) {
    try {
      await blobStorage.deleteObject(key);
    } catch (error) {
      console.error("[r2] delete failed", { jobId, key, error });
      // continue — still remove DB row
    }
  }

  jobRepository.deleteById(jobId);
}
