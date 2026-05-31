import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { config } from "../core/config.ts";

const client = new S3Client({
  region: "auto",
  endpoint: config.r2.endpoint,
  credentials: {
    accessKeyId: config.r2.accessKeyId,
    secretAccessKey: config.r2.secretAccessKey,
  },
});

export function publicUrlForKey(key: string): string {
  const base = config.r2.publicUrl!.replace(/\/$/, "");
  return `${base}/${key}`;
}

export function originalKey(
  sessionId: string,
  jobId: string,
  ext: string,
): string {
  return `sessions/${sessionId}/jobs/${jobId}/original.${ext}`;
}

export function processedKey(sessionId: string, jobId: string): string {
  return `sessions/${sessionId}/jobs/${jobId}/processed.png`;
}

export async function putObject(
  key: string,
  body: Uint8Array,
  contentType: string,
): Promise<void> {
  await client.send(
    new PutObjectCommand({
      Bucket: config.r2.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function deleteObject(key: string): Promise<void> {
  await client.send(
    new DeleteObjectCommand({
      Bucket: config.r2.bucket,
      Key: key,
    }),
  );
}

export async function getObject(
  key: string,
): Promise<{ body: Uint8Array; contentType: string }> {
  const result = await client.send(
    new GetObjectCommand({
      Bucket: config.r2.bucket,
      Key: key,
    }),
  );

  if (!result.Body) throw new Error(`Empty body for key: ${key}`);

  const bytes = new Uint8Array(await result.Body.transformToByteArray());
  return {
    body: bytes,
    contentType: result.ContentType ?? "application/octet-stream",
  };
}
