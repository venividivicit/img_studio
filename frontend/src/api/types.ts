export type JobStatus = "processing" | "completed" | "failed";

export type ApiErrorCode =
  | "UNAUTHORIZED_SESSION"
  | "FILE_REQUIRED"
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_TYPE"
  | "JOB_NOT_FOUND"
  | "PROCESSING_FAILED"
  | "INTERNAL_ERROR"
  | "NETWORK"
  | "CLIENT_VALIDATION"
  | "NOT_FOUND";

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

export type JobsListResponse = {
  jobs: JobDto[];
};

export type SessionResponse = {
  sessionId: string;
};

export type ApiErrorBody = {
  error: {
    code: ApiErrorCode;
    message: string;
  };
};
