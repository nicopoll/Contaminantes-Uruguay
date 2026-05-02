import { useEffect, useState } from "react";
import type { Sample } from "../lib/types";

interface UseSamplesResult {
  samples: Sample[];
  error: Error | null;
  loading: boolean;
}

export function useSamples(): UseSamplesResult {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/sample-data.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Sample[]>;
      })
      .then((data) => {
        if (!cancelled) setSamples(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { samples, error, loading };
}
