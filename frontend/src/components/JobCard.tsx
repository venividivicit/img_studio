import { useState } from "react";
import { jobImageUrl } from "../api/jobs";
import type { JobDto } from "../api/types";
import { useJobs } from "../context/useJobs";

type JobCardProps = {
  job: JobDto;
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function ImagePanel({
  label,
  src,
  alt,
  empty,
}: {
  label: string;
  src: string | null;
  alt: string;
  empty?: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
        {src ? (
          <img
            src={jobImageUrl(src)}
            alt={alt}
            className="h-full w-full object-contain"
            loading="lazy"
          />
        ) : (
          empty ?? (
            <span className="px-3 text-center text-xs text-zinc-600">—</span>
          )
        )}
      </div>
    </div>
  );
}

export function JobCard({ job }: JobCardProps) {
  const { removeJob, deletingJobId } = useJobs();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isDeleting = deletingJobId === job.id;

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    const ok = await removeJob(job.id);
    if (!ok) setConfirmDelete(false);
  };

  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-100">
            {job.originalFilename}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">{formatWhen(job.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => void handleDelete()}
            onBlur={() => setConfirmDelete(false)}
            className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              confirmDelete
                ? "border-red-500/60 bg-red-500/20 text-red-200 hover:bg-red-500/30"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
            }`}
          >
            {isDeleting
              ? "Deleting…"
              : confirmDelete
                ? "Confirm delete"
                : "Delete"}
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <ImagePanel
          label="Before"
          src={job.urls.original}
          alt={`Original: ${job.originalFilename}`}
        />
        <ImagePanel
          label="After"
          src={job.urls.processed}
          alt={`Processed: ${job.originalFilename}`}
          empty={
            job.status === "processing" ? (
              <div className="flex flex-col items-center gap-2 px-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-400" />
                <span className="text-center text-xs text-indigo-300/90">
                  Processing…
                </span>
              </div>
            ) : job.status === "failed" ? (
              <span className="px-3 text-center text-xs text-red-400">
                {job.error?.message ?? "Processing failed"}
              </span>
            ) : undefined
          }
        />
      </div>
    </article>
  );
}
