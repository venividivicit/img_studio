import { AppApiError } from "../api/errors";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);

export function validateImageFile(file: File): AppApiError | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return new AppApiError(
      "UNSUPPORTED_TYPE",
      "Only JPEG and PNG images are allowed.",
      { source: "client" },
    );
  }
  if (file.size > MAX_BYTES) {
    return new AppApiError(
      "FILE_TOO_LARGE",
      "Image must be 5 MB or smaller.",
      { source: "client" },
    );
  }
  if (file.size === 0) {
    return new AppApiError("FILE_REQUIRED", "Image file is required.", {
      source: "client",
    });
  }
  return null;
}
