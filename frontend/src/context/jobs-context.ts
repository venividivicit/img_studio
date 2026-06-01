import { createContext } from "react";
import type { AppApiError } from "../api/errors";
import type { JobDto } from "../api/types";

export type JobsContextValue = {
  jobs: JobDto[];
  loading: boolean;
  sessionReady: boolean;
  bannerError: AppApiError | null;
  clearBannerError: () => void;
  refreshJobs: () => Promise<void>;
  uploadFile: (file: File) => Promise<JobDto | null>;
  removeJob: (jobId: string) => Promise<boolean>;
  deletingJobId: string | null;
};

export const JobsContext = createContext<JobsContextValue | null>(null);
