import type { ParsedTrain } from "../api/trains";

/** Recompute bearing after this much travel (~30 km/h at a 3s poll). */
export const HEADING_MOVE_M = 25;
/** Hide the arrow below this; GPS jitter on parked trains stays blank. */
export const HEADING_STOP_M = 12;

export type HeadingTrack = {
  lat: number;
  lon: number;
  heading?: number;
};

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function distanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const r = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Initial bearing in degrees: north = 0, clockwise. */
export function initialBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function applyTrainHeadings(
  prev: Map<string, HeadingTrack>,
  trains: ParsedTrain[],
): { trains: ParsedTrain[]; next: Map<string, HeadingTrack> } {
  const next = new Map<string, HeadingTrack>();

  const withHeading = trains.map((train) => {
    const last = prev.get(train.id);
    if (!last) {
      next.set(train.id, { lat: train.lat, lon: train.lon });
      return { ...train, heading: undefined };
    }

    const meters = distanceMeters(last.lat, last.lon, train.lat, train.lon);
    const speedZero = train.speed === 0;
    let heading = last.heading;
    let show = false;

    if (speedZero) {
      show = false;
    } else if (meters >= HEADING_MOVE_M) {
      heading = initialBearing(last.lat, last.lon, train.lat, train.lon);
      show = true;
    } else if (heading != null && meters >= HEADING_STOP_M) {
      // Slow crawl: keep last good heading, do not recompute from jitter.
      show = true;
    }

    next.set(train.id, { lat: train.lat, lon: train.lon, heading });
    return show && heading != null
      ? { ...train, heading }
      : { ...train, heading: undefined };
  });

  return { trains: withHeading, next };
}
