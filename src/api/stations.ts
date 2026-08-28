import { API_ORIGIN, parseWgs84Point } from "./trains";

export type StationRecord = {
  signature: string;
  name: string;
  lat: number;
  lon: number;
};

function stationsUrl(): string {
  return import.meta.env.DEV ? "/api/stations" : `${API_ORIGIN}/api/stations`;
}

function readGeometryWgs84(geometry: unknown): string | null {
  if (!geometry || typeof geometry !== "object") return null;
  const rec = geometry as Record<string, unknown>;
  if (typeof rec.WGS84 === "string") return rec.WGS84;
  if (typeof rec.wgs84 === "string") return rec.wgs84;
  return null;
}

export function parseStations(payload: unknown): StationRecord[] {
  if (!Array.isArray(payload)) {
    throw new Error("Stationerna kunde inte tolkas.");
  }

  const stations: StationRecord[] = [];
  for (const item of payload) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const signature =
      typeof rec.locationSignature === "string"
        ? rec.locationSignature.trim()
        : "";
    if (!signature) continue;

    const wgs84 = readGeometryWgs84(rec.geometry);
    if (!wgs84) continue;
    const point = parseWgs84Point(wgs84);
    if (!point) continue;

    const name =
      (typeof rec.locationName === "string" && rec.locationName.trim()) ||
      (typeof rec.shortLocationName === "string" &&
        rec.shortLocationName.trim()) ||
      signature;

    stations.push({
      signature,
      name,
      lat: point.lat,
      lon: point.lon,
    });
  }
  return stations;
}

export function indexStations(
  stations: StationRecord[],
): Map<string, StationRecord> {
  const index = new Map<string, StationRecord>();
  for (const station of stations) {
    index.set(station.signature, station);
  }
  return index;
}

export async function fetchStations(): Promise<StationRecord[]> {
  let response: Response;
  try {
    response = await fetch(stationsUrl(), {
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new Error("Kunde inte hämta stationer. Kontrollera nätverket.");
  }

  if (!response.ok) {
    throw new Error(`Kunde inte hämta stationer (HTTP ${response.status}).`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Stationerna kunde inte tolkas.");
  }

  return parseStations(payload);
}
