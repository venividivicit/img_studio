export type ErrorCode =
  | "UNAUTHORIZED_SESSION"
  | "FILE_REQUIRED"
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_TYPE"
  | "JOB_NOT_FOUND"
  | "PROCESSING_FAILED"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toClientError(error: unknown): {
  status: number;
  body: { error: { code: ErrorCode; message: string } };
} {
  if (isAppError(error)) {
    return {
      status: error.status,
      body: { error: { code: error.code, message: error.message } },
    };
  }

  console.error("[internal]", error);
  return {
    status: 500,
    body: {
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong. Please try again.",
      },
    },
  };
}
