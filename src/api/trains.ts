export const API_ORIGIN = "https://trafikverket-api-production.up.railway.app";
export const POLL_MS = 8000;

export type TrainInfo = {
  operationalTrainNumber: string;
  operationalTrainDepartureDate: string;
  journeyPlanNumber: string;
  journeyPlanDepartureDate: string;
  advertisedTrainNumber: string;
  operator?: string;
};

export type TrainPosition = {
  train: TrainInfo;
  position: { wgs84: string };
  status: { active: boolean };
  modifiedTime: string;
  operator?: string;
};

export type ParsedTrain = {
  id: string;
  lat: number;
  lon: number;
  advertisedTrainNumber: string;
  operationalTrainNumber: string;
  operationalTrainDepartureDate: string;
  active: boolean;
  modifiedTime: string;
  operator?: string;
};

const POINT_RE =
  /POINT\s*\(\s*([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)\s+([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)\s*\)/i;

export function parseWgs84Point(
  wgs84: string,
): { lat: number; lon: number } | null {
  const match = POINT_RE.exec(wgs84.trim());
  if (!match) return null;

  const lon = Number(match[1]);
  const lat = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;

  return { lat, lon };
}

export function trainIdentity(train: TrainInfo | undefined): string | null {
  if (!train) return null;

  const operational = train.operationalTrainNumber?.trim();
  const departureDate = train.operationalTrainDepartureDate?.trim();
  if (operational && departureDate) return `${operational}|${departureDate}`;

  const advertised = train.advertisedTrainNumber?.trim();
  return advertised || null;
}

function readOperator(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }
  return undefined;
}

function parseOne(item: unknown): ParsedTrain | null {
  if (!item || typeof item !== "object") return null;

  const rec = item as Partial<TrainPosition> & Record<string, unknown>;
  const id = trainIdentity(rec.train);
  if (!id) return null;

  const wgs84 = rec.position?.wgs84;
  if (typeof wgs84 !== "string") return null;

  const point = parseWgs84Point(wgs84);
  if (!point) return null;

  const advertised =
    rec.train?.advertisedTrainNumber?.trim() ||
    rec.train?.operationalTrainNumber?.trim() ||
    id;
  const operational = rec.train?.operationalTrainNumber?.trim() || advertised;
  const operator = readOperator(rec.operator, rec.train?.operator);

  return {
    id,
    lat: point.lat,
    lon: point.lon,
    advertisedTrainNumber: advertised,
    operationalTrainNumber: operational,
    operationalTrainDepartureDate:
      rec.train?.operationalTrainDepartureDate?.trim() ?? "",
    active: rec.status?.active === true,
    modifiedTime: typeof rec.modifiedTime === "string" ? rec.modifiedTime : "",
    operator,
  };
}

export function parseTrainPositions(payload: unknown): ParsedTrain[] {
  if (!Array.isArray(payload)) {
    throw new Error("Tågpositionerna kunde inte tolkas.");
  }

  const trains: ParsedTrain[] = [];
  for (const item of payload) {
    const parsed = parseOne(item);
    if (parsed) trains.push(parsed);
  }
  return trains;
}

export function positionUrl(): string {
  return import.meta.env.DEV
    ? "/api/train/position"
    : `${API_ORIGIN}/api/train/position`;
}

export async function fetchTrainPositions(): Promise<ParsedTrain[]> {
  let response: Response;
  try {
    response = await fetch(positionUrl(), {
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new Error("Kunde inte hämta tågpositioner. Kontrollera nätverket.");
  }

  if (!response.ok) {
    throw new Error(
      `Kunde inte hämta tågpositioner (HTTP ${response.status}).`,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Tågpositionerna kunde inte tolkas.");
  }

  return parseTrainPositions(payload);
}
