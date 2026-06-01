import { apiClient } from "./client";
import type { JobDto, JobsListResponse } from "./types";

export async function listJobs(): Promise<JobsListResponse> {
  const { data } = await apiClient.get<JobsListResponse>("/jobs");
  return data;
}

export async function getJob(jobId: string): Promise<JobDto> {
  const { data } = await apiClient.get<JobDto>(`/jobs/${jobId}`);
  return data;
}

export async function uploadJob(file: File): Promise<JobDto> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post<JobDto>("/jobs", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteJob(jobId: string): Promise<void> {
  await apiClient.delete(`/jobs/${jobId}`);
}

export function jobImageUrl(path: string): string {
  return path;
}
