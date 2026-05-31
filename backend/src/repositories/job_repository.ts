import { getDb } from "../db/client.ts";
import type { JobRecord, JobStatus } from "../types/job.ts";

export type InsertJobInput = {
  id: string;
  sessionId: string;
  originalFilename: string;
  originalMime: string;
  originalBytes: number;
  originalR2Key: string | null;
};

export const jobRepository = {
  insert(input: InsertJobInput): void {
    getDb().run(
      `INSERT INTO jobs (
              id, session_id, status,
              original_filename, original_mime, original_bytes,
              original_r2_key
            ) VALUES (?, ?, 'processing', ?, ?, ?, ?)`,
      [
        input.id,
        input.sessionId,
        input.originalFilename,
        input.originalMime,
        input.originalBytes,
        input.originalR2Key,
      ],
    );
  },
  findByIdAndSession(jobId: string, sessionId: string): JobRecord | null {
    return (
      getDb()
        .query<
          JobRecord,
          [string, string]
        >("SELECT * FROM jobs WHERE id = ? AND session_id = ?")
        .get(jobId, sessionId) ?? null
    );
  },

  listBySession(sessionId: string, limit: number): JobRecord[] {
    return getDb()
      .query<JobRecord, [string, number]>(
        `SELECT * FROM jobs
         WHERE session_id = ?
         ORDER BY created_at DESC
         LIMIT ?`,
      )
      .all(sessionId, limit);
  },

  updateAfterUpload(jobId: string, originalR2Key: string): void {
    getDb().run("UPDATE jobs SET original_r2_key = ? WHERE id = ?", [
      originalR2Key,
      jobId,
    ]);
  },

  updateStatus(
    jobId: string,
    status: JobStatus,
    patch: {
      processedR2Key?: string | null;
      errorCode?: string | null;
      errorMessage?: string | null;
      completedAt?: string | null;
    } = {},
  ): void {
    getDb().run(
      `UPDATE jobs SET
        status = ?,
        processed_r2_key = COALESCE(?, processed_r2_key),
        error_code = COALESCE(?, error_code),
        error_message = COALESCE(?, error_message),
        completed_at = COALESCE(?, completed_at)
      WHERE id = ?`,
      [
        status,
        patch.processedR2Key ?? null,
        patch.errorCode ?? null,
        patch.errorMessage ?? null,
        patch.completedAt ?? null,
        jobId,
      ],
    );
  },
  deleteById(jobId: string): void {
    getDb().run("DELETE FROM jobs WHERE id = ?", [jobId]);
  },
};
