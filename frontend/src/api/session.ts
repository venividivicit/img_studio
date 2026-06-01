import { apiClient } from "./client";
import type { SessionResponse } from "./types";

export async function ensureSession(): Promise<SessionResponse> {
  const { data } = await apiClient.post<SessionResponse>("/sessions");
  return data;
}
