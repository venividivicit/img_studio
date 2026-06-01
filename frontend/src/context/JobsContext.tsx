import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AppApiError, parseAxiosError } from "../api/errors";
import * as jobsApi from "../api/jobs";
import { ensureSession } from "../api/session";
import type { JobDto } from "../api/types";
import { validateImageFile } from "../lib/validateImage";
import { JobsContext } from "./jobs-context";

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<JobDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [bannerError, setBannerError] = useState<AppApiError | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  const clearBannerError = useCallback(() => setBannerError(null), []);

  const showBannerError = useCallback((error: AppApiError) => {
    setBannerError(error);
  }, []);

  const refreshJobs = useCallback(async () => {
    const data = await jobsApi.listJobs();
    setJobs(data.jobs);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await ensureSession();
        if (cancelled) return;

        setSessionReady(true);

        const data = await jobsApi.listJobs();
        if (cancelled) return;

        setJobs(data.jobs);
        setBannerError(null);
      } catch (error) {
        if (cancelled) return;
        setBannerError(parseAxiosError(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, []);

  const hasProcessing = jobs.some((j) => j.status === "processing");

  useEffect(() => {
    if (!sessionReady || !hasProcessing) return;

    const timer = window.setInterval(() => {
      void refreshJobs().catch((error) => {
        setBannerError(parseAxiosError(error));
      });
    }, 2000);

    return () => window.clearInterval(timer);
  }, [hasProcessing, refreshJobs, sessionReady]);

  const uploadFile = useCallback(
    async (file: File): Promise<JobDto | null> => {
      const validationError = validateImageFile(file);
      if (validationError) {
        showBannerError(validationError);
        return null;
      }

      try {
        const job = await jobsApi.uploadJob(file);
        setJobs((prev) => [job, ...prev.filter((j) => j.id !== job.id)]);
        setBannerError(null);
        return job;
      } catch (error) {
        showBannerError(parseAxiosError(error));
        return null;
      }
    },
    [showBannerError],
  );

  const removeJob = useCallback(
    async (jobId: string): Promise<boolean> => {
      setDeletingJobId(jobId);
      try {
        await jobsApi.deleteJob(jobId);
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
        return true;
      } catch (error) {
        showBannerError(parseAxiosError(error));
        return false;
      } finally {
        setDeletingJobId(null);
      }
    },
    [showBannerError],
  );

  const value = useMemo(
    () => ({
      jobs,
      loading,
      sessionReady,
      bannerError,
      clearBannerError,
      refreshJobs,
      uploadFile,
      removeJob,
      deletingJobId,
    }),
    [
      jobs,
      loading,
      sessionReady,
      bannerError,
      clearBannerError,
      refreshJobs,
      uploadFile,
      removeJob,
      deletingJobId,
    ],
  );

  return (
    <JobsContext.Provider value={value}>{children}</JobsContext.Provider>
  );
}
