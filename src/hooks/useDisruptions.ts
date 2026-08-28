import { useCallback, useEffect, useRef, useState } from "react";
import {
  DISRUPTION_POLL_MS,
  fetchDisruptions,
  type ParsedDisruption,
} from "../api/disruptions";

export type DisruptionsState = {
  disruptions: ParsedDisruption[];
  error: string | null;
  loading: boolean;
};

export function useDisruptions(
  enabled: boolean,
  intervalMs = DISRUPTION_POLL_MS,
): DisruptionsState {
  const [disruptions, setDisruptions] = useState<ParsedDisruption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const next = await fetchDisruptions();
      setDisruptions(next);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Kunde inte hämta störningar.",
      );
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void load();
    const id = window.setInterval(() => {
      void load();
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, load, intervalMs]);

  return { disruptions, error, loading };
}
