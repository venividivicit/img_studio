// backend/src/types/job.ts

export type JobStatus = "processing" | "completed" | "failed";

export type JobRecord = {
  id: string;
  session_id: string;
  status: JobStatus;
  original_filename: string;
  original_mime: string;
  original_bytes: number;
  original_r2_key: string | null;
  processed_r2_key: string | null;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
};

export type JobDto = {
  id: string;
  status: JobStatus;
  originalFilename: string;
  originalMime: string;
  originalBytes: number;
  createdAt: string;
  completedAt: string | null;
  error: { code: string; message: string } | null;
  urls: {
    original: string;
    processed: string | null;
  };
};

export function toJobDto(row: JobRecord): JobDto {
  return {
    id: row.id,
    status: row.status,
    originalFilename: row.original_filename,
    originalMime: row.original_mime,
    originalBytes: row.original_bytes,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    error:
      row.error_code && row.error_message
        ? { code: row.error_code, message: row.error_message }
        : null,
    urls: {
      original: `/api/jobs/${row.id}/original`,
      processed: row.processed_r2_key ? `/api/jobs/${row.id}/processed` : null,
    },
  };
}
