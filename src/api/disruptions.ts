import { API_ORIGIN } from "./trains";

export const DISRUPTION_POLL_MS = 60_000;

export type DisruptionStation = {
  signature: string;
  name?: string;
};

export type ParsedDisruption = {
  id: string;
  header?: string;
  description?: string;
  reason?: string;
  startTime?: string;
  endTime?: string;
  modifiedTime?: string;
  stations: DisruptionStation[];
  trains: string[];
};

function disruptionsUrl(): string {
  return import.meta.env.DEV
    ? "/api/disruptions"
    : `${API_ORIGIN}/api/disruptions`;
}

function readOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function asStation(item: unknown): DisruptionStation | null {
  if (!item || typeof item !== "object") return null;
  const rec = item as Record<string, unknown>;
  const signature = readOptionalString(rec.signature);
  if (!signature) return null;
  const name = readOptionalString(rec.name);
  return name ? { signature, name } : { signature };
}

function asTrainList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const trains: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== "string") continue;
    const text = item.trim();
    if (!text || seen.has(text)) continue;
    seen.add(text);
    trains.push(text);
  }
  return trains;
}

export function parseDisruptions(payload: unknown): ParsedDisruption[] {
  if (!Array.isArray(payload)) {
    throw new Error("Störningarna kunde inte tolkas.");
  }

  const disruptions: ParsedDisruption[] = [];
  for (const item of payload) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const id = readOptionalString(rec.id);
    if (!id) continue;

    const stations = Array.isArray(rec.stations)
      ? rec.stations.flatMap((station) => {
          const parsed = asStation(station);
          return parsed ? [parsed] : [];
        })
      : [];

    disruptions.push({
      id,
      header: readOptionalString(rec.header),
      description: readOptionalString(rec.description),
      reason: readOptionalString(rec.reason),
      startTime: readOptionalString(rec.startTime),
      endTime: readOptionalString(rec.endTime),
      modifiedTime: readOptionalString(rec.modifiedTime),
      stations,
      trains: asTrainList(rec.trains),
    });
  }
  return disruptions;
}

export async function fetchDisruptions(): Promise<ParsedDisruption[]> {
  let response: Response;
  try {
    response = await fetch(disruptionsUrl(), {
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new Error("Kunde inte hämta störningar. Kontrollera nätverket.");
  }

  if (!response.ok) {
    throw new Error(
      `Kunde inte hämta störningar (HTTP ${response.status}).`,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Störningarna kunde inte tolkas.");
  }

  return parseDisruptions(payload);
}
