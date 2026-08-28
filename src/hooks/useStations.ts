import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchStations,
  indexStations,
  type StationRecord,
} from "../api/stations";

export type StationsState = {
  bySignature: Map<string, StationRecord>;
  error: string | null;
  loading: boolean;
};

export function useStations(): StationsState {
  const [bySignature, setBySignature] = useState(
    () => new Map<string, StationRecord>(),
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const started = useRef(false);

  const load = useCallback(async () => {
    try {
      const stations = await fetchStations();
      setBySignature(indexStations(stations));
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Kunde inte visa störningar (stationer saknas).",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void load();
  }, [load]);

  return { bySignature, error, loading };
}
