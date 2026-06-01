import { useEffect, useMemo, useState } from "react";

/** Animates only jobs added after the initial history load (avoids stagger on refresh). */
export function useJobEnterAnimation(
  jobIds: string[],
  loading: boolean,
): (id: string) => boolean {
  const [seenIds, setSeenIds] = useState<ReadonlySet<string> | null>(null);

  if (loading && seenIds !== null) {
    setSeenIds(null);
  }

  if (!loading && seenIds === null) {
    setSeenIds(new Set(jobIds));
  }

  const enteringIds = useMemo(() => {
    if (loading || seenIds === null) return new Set<string>();
    const entering = new Set<string>();
    for (const id of jobIds) {
      if (!seenIds.has(id)) entering.add(id);
    }
    return entering;
  }, [jobIds, loading, seenIds]);

  useEffect(() => {
    if (loading || seenIds === null || enteringIds.size === 0) return;

    const idsToMark = [...enteringIds];
    const frame = requestAnimationFrame(() => {
      setSeenIds((prev) => {
        if (!prev) return prev;
        const next = new Set(prev);
        for (const id of idsToMark) next.add(id);
        return next;
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [enteringIds, loading, seenIds]);

  return (id: string) => enteringIds.has(id);
}
