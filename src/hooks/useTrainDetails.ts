import { useEffect, useState } from "react";
import {
  fetchTrainJourney,
  TrainNotFoundError,
  type TrainJourney,
} from "../api/journey";

export type TrainDetailsState = {
  details: TrainJourney | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
};

export function useTrainDetails(
  advertisedTrainNumber: string | null,
): TrainDetailsState {
  const [details, setDetails] = useState<TrainJourney | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!advertisedTrainNumber) {
      setDetails(null);
      setLoading(false);
      setError(null);
      setNotFound(false);
      return;
    }

    const abort = new AbortController();
    setLoading(true);
    setError(null);
    setNotFound(false);
    setDetails(null);

    void (async () => {
      try {
        const journey = await fetchTrainJourney(
          advertisedTrainNumber,
          abort.signal,
        );
        if (abort.signal.aborted) return;
        setDetails(journey);
        setNotFound(false);
        setError(null);
      } catch (err) {
        if (abort.signal.aborted) return;
        if (err instanceof TrainNotFoundError) {
          setDetails(null);
          setNotFound(true);
          setError(null);
          return;
        }
        setDetails(null);
        setNotFound(false);
        setError(
          err instanceof Error
            ? err.message
            : "Kunde inte hämta tidtabellen.",
        );
      } finally {
        if (!abort.signal.aborted) setLoading(false);
      }
    })();

    return () => abort.abort();
  }, [advertisedTrainNumber]);

  return { details, loading, error, notFound };
}
