import { useJobs } from "../context/useJobs";
import { useJobEnterAnimation } from "../hooks/useJobEnterAnimation";
import { JobCard } from "./JobCard";

export function WorkHistory() {
  const { jobs, loading } = useJobs();
  const jobIds = jobs.map((j) => j.id);
  const shouldAnimateEnter = useJobEnterAnimation(jobIds, loading);

  return (
    <section className="w-full">
      <h2 className="mb-4 text-lg font-medium text-zinc-100">Work history</h2>

      <div className="min-h-[280px]">
        {loading ? (
          <div className="flex h-[280px] items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-400" />
          </div>
        ) : jobs.length === 0 ? (
          <p className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 text-center text-sm text-zinc-500">
            Upload an image to see before and after results here.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {jobs.map((job) => (
              <li
                key={job.id}
                className={
                  shouldAnimateEnter(job.id) ? "animate-job-enter" : undefined
                }
              >
                <JobCard job={job} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
