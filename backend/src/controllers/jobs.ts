import { withSession } from "../middleware/session.ts";
import { json } from "../lib/http.ts";
import { toJobDto } from "../types/job.ts";
import * as jobService from "../services/job_service.ts";
import type { BunRequest } from "bun";

type JobByIdRequest = BunRequest<"/api/jobs/:id">;
type JobOriginalRequest = BunRequest<"/api/jobs/:id/original">;
type JobProcessedRequest = BunRequest<"/api/jobs/:id/processed">;

import { AppError } from "../lib/errors.ts";

function imageResponse(body: Uint8Array, contentType: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}

export const jobsRoutes = {
  "/api/jobs": {
    GET: withSession(async (_req, ctx) => {
      const rows = jobService.listJobs(ctx.sessionId);
      return json({ jobs: rows.map(toJobDto) });
    }),
    POST: withSession(async (req, ctx) => {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        throw new AppError("FILE_REQUIRED", "Field 'file' is required.", 400);
      }
      const row = await jobService.createJobFromUpload(ctx.sessionId, file);
      return json(toJobDto(row), { status: 201 });
    }),
  },
  "/api/jobs/:id": {
    GET: withSession<JobByIdRequest>(async (req, ctx) => {
      const row = jobService.getJob(req.params.id, ctx.sessionId);
      return json(toJobDto(row));
    }),
    DELETE: withSession<JobByIdRequest>(async (req, ctx) => {
      await jobService.deleteJob(req.params.id, ctx.sessionId);
      return new Response(null, { status: 204 });
    }),
  },
  "/api/jobs/:id/original": {
    GET: withSession<JobOriginalRequest>(async (req, ctx) => {
      const { body, contentType } = await jobService.getJobOriginalBytes(
        req.params.id,
        ctx.sessionId,
      );
      return imageResponse(body, contentType);
    }),
  },
  "/api/jobs/:id/processed": {
    GET: withSession<JobProcessedRequest>(async (req, ctx) => {
      const { body, contentType } = await jobService.getJobProcessedBytes(
        req.params.id,
        ctx.sessionId,
      );
      return imageResponse(body, contentType);
    }),
  },
} as const;
