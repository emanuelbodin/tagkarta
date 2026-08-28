import { API_ORIGIN } from "./trains";

export type TrainStopActivity = "departure" | "arrival";

export type TrainStop = {
  fromName: string;
  toName: string;
  activity?: TrainStopActivity;
  advertisedTime?: string;
  estimatedTime?: string;
  canceled: boolean;
  delayed: boolean;
  track?: string;
  reason?: string;
};

export type TrainJourney = {
  id: string;
  operator?: string;
  fromName: string;
  toName: string;
  canceled: boolean;
  stops: TrainStop[];
};

export class TrainNotFoundError extends Error {
  constructor() {
    super("Ingen tidtabell hittades");
    this.name = "TrainNotFoundError";
  }
}

function journeyUrl(id: string): string {
  const encoded = encodeURIComponent(id);
  return import.meta.env.DEV
    ? `/api/trains/${encoded}`
    : `${API_ORIGIN}/api/trains/${encoded}`;
}

function asStop(item: unknown): TrainStop | null {
  if (!item || typeof item !== "object") return null;
  const rec = item as Record<string, unknown>;

  const activity =
    rec.activity === "departure" || rec.activity === "arrival"
      ? rec.activity
      : undefined;

  const stop: TrainStop = {
    fromName: typeof rec.fromName === "string" ? rec.fromName : "",
    toName: typeof rec.toName === "string" ? rec.toName : "",
    canceled: rec.canceled === true,
    delayed: rec.delayed === true,
  };

  if (activity) stop.activity = activity;
  if (typeof rec.advertisedTime === "string") {
    stop.advertisedTime = rec.advertisedTime;
  }
  if (typeof rec.estimatedTime === "string") {
    stop.estimatedTime = rec.estimatedTime;
  }
  if (typeof rec.track === "string" && rec.track.trim()) {
    stop.track = rec.track;
  }
  if (typeof rec.reason === "string" && rec.reason.trim()) {
    stop.reason = rec.reason;
  }

  return stop;
}

export function parseTrainJourney(payload: unknown): TrainJourney {
  if (!payload || typeof payload !== "object") {
    throw new Error("Tidtabellen kunde inte tolkas.");
  }

  const rec = payload as Record<string, unknown>;
  const stops = Array.isArray(rec.stops)
    ? rec.stops.flatMap((item) => {
        const stop = asStop(item);
        return stop ? [stop] : [];
      })
    : [];

  return {
    id: typeof rec.id === "string" ? rec.id : "",
    operator: typeof rec.operator === "string" ? rec.operator : undefined,
    fromName: typeof rec.fromName === "string" ? rec.fromName : "",
    toName: typeof rec.toName === "string" ? rec.toName : "",
    canceled: rec.canceled === true,
    stops,
  };
}

export async function fetchTrainJourney(
  advertisedTrainNumber: string,
  signal?: AbortSignal,
): Promise<TrainJourney> {
  let response: Response;
  try {
    response = await fetch(journeyUrl(advertisedTrainNumber), {
      headers: { Accept: "application/json" },
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new Error("Kunde inte hämta tidtabellen. Kontrollera nätverket.");
  }

  if (response.status === 404) {
    throw new TrainNotFoundError();
  }

  if (!response.ok) {
    throw new Error(`Kunde inte hämta tidtabellen (HTTP ${response.status}).`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Tidtabellen kunde inte tolkas.");
  }

  return parseTrainJourney(payload);
}
