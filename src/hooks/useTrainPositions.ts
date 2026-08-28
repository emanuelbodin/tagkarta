import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchTrainPositions,
  POLL_MS,
  type ParsedTrain,
} from "../api/trains";
import { applyTrainHeadings, type HeadingTrack } from "../lib/heading";

export type TrainPositionsState = {
  trains: ParsedTrain[];
  updatedAt: Date | null;
  error: string | null;
  loading: boolean;
};

export function useTrainPositions(
  intervalMs = POLL_MS,
): TrainPositionsState {
  const [trains, setTrains] = useState<ParsedTrain[]>([]);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const inFlight = useRef(false);
  const tracks = useRef(new Map<string, HeadingTrack>());

  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const next = await fetchTrainPositions();
      const headed = applyTrainHeadings(tracks.current, next);
      tracks.current = headed.next;
      setTrains(headed.trains);
      setUpdatedAt(new Date());
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Kunde inte hämta tågpositioner.",
      );
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => {
      void load();
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [load, intervalMs]);

  return { trains, updatedAt, error, loading };
}
