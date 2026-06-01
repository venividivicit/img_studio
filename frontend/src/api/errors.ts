import axios from "axios";
import type { ApiErrorCode } from "./types";

export type { ApiErrorCode };

export class AppApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;
  readonly source: "api" | "network" | "client";

  constructor(
    code: ApiErrorCode,
    message: string,
    options?: {
      status?: number;
      source?: "api" | "network" | "client";
    },
  ) {
    super(message);
    this.name = "AppApiError";
    this.code = code;
    this.status = options?.status;
    this.source = options?.source ?? "api";
  }
}

const ERROR_COPY: Record<ApiErrorCode, string> = {
  UNAUTHORIZED_SESSION: "Session is invalid. Refresh the page.",
  FILE_REQUIRED: "Please choose an image file.",
  FILE_TOO_LARGE: "Image must be 5 MB or smaller.",
  UNSUPPORTED_TYPE: "Only JPEG and PNG images are supported.",
  JOB_NOT_FOUND: "This job was not found or was already removed.",
  PROCESSING_FAILED: "Could not process image. Please try again.",
  INTERNAL_ERROR: "Something went wrong. Please try again.",
  NETWORK: "Could not reach the server. Check your connection and try again.",
  CLIENT_VALIDATION: "The selected file is not valid.",
  NOT_FOUND: "The requested resource was not found.",
};

export function userFacingMessage(error: AppApiError): string {
  return error.message || ERROR_COPY[error.code] || ERROR_COPY.INTERNAL_ERROR;
}

export function parseAxiosError(error: unknown): AppApiError {
  if (error instanceof AppApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return new AppApiError("NETWORK", ERROR_COPY.NETWORK, {
        source: "network",
      });
    }

    const data = error.response.data as
      | { error?: { code?: ApiErrorCode; message?: string } }
      | undefined;
    const code = data?.error?.code ?? "INTERNAL_ERROR";
    const message =
      data?.error?.message ?? ERROR_COPY[code] ?? ERROR_COPY.INTERNAL_ERROR;

    return new AppApiError(code, message, {
      status: error.response.status,
      source: "api",
    });
  }

  if (error instanceof Error) {
    return new AppApiError("INTERNAL_ERROR", error.message, {
      source: "client",
    });
  }

  return new AppApiError("INTERNAL_ERROR", ERROR_COPY.INTERNAL_ERROR, {
    source: "client",
  });
}
