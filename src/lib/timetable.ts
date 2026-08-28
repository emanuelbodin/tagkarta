import type { TrainStop } from "../api/journey";
import { formatStockholmClock, stockholmDateKey } from "./formatTime";

const JOURNEY_GAP_MS = 8 * 60 * 60 * 1000;

export type TimetableRow = {
  station: string;
  advertisedTime: string;
  estimatedTime?: string;
  delayed: boolean;
  canceled: boolean;
  track?: string;
  reason?: string;
};

function stationName(stop: TrainStop): string {
  return stop.fromName.trim();
}

function advertisedMs(stop: TrainStop): number | null {
  if (!stop.advertisedTime) return null;
  const ms = Date.parse(stop.advertisedTime);
  return Number.isFinite(ms) ? ms : null;
}

function splitJourneys(stops: TrainStop[]): TrainStop[][] {
  const journeys: TrainStop[][] = [];
  let current: TrainStop[] = [];
  let lastMs: number | null = null;

  for (const stop of stops) {
    const ms = advertisedMs(stop);
    if (
      current.length > 0 &&
      lastMs != null &&
      ms != null &&
      ms - lastMs > JOURNEY_GAP_MS
    ) {
      journeys.push(current);
      current = [];
    }
    current.push(stop);
    if (ms != null) lastMs = ms;
  }

  if (current.length > 0) journeys.push(current);
  return journeys;
}

function pickJourney(
  journeys: TrainStop[][],
  preferredDateIso?: string,
): TrainStop[] {
  if (journeys.length === 0) return [];
  if (journeys.length === 1) return journeys[0];

  const preferred = preferredDateIso
    ? stockholmDateKey(preferredDateIso)
    : null;

  if (preferred) {
    const match = [...journeys]
      .reverse()
      .find((journey) =>
        journey.some(
          (stop) =>
            stop.advertisedTime != null &&
            stockholmDateKey(stop.advertisedTime) === preferred,
        ),
      );
    if (match) return match;
  }

  return journeys[journeys.length - 1];
}

function collapseConsecutive(stops: TrainStop[]): TrainStop[][] {
  const groups: TrainStop[][] = [];
  for (const stop of stops) {
    const last = groups[groups.length - 1];
    if (last && stationName(last[0]) === stationName(stop)) {
      last.push(stop);
    } else {
      groups.push([stop]);
    }
  }
  return groups;
}

function pickPrimaryStop(
  group: TrainStop[],
  isFirst: boolean,
  isLast: boolean,
): TrainStop {
  const withTime = (activity: TrainStop["activity"]) =>
    group.find((stop) => stop.activity === activity && stop.advertisedTime);

  if (isLast) {
    return withTime("arrival") ?? withTime("departure") ?? group[0];
  }
  if (isFirst) {
    return withTime("departure") ?? withTime("arrival") ?? group[0];
  }
  return withTime("departure") ?? withTime("arrival") ?? group[0];
}

function groupToRow(
  group: TrainStop[],
  isFirst: boolean,
  isLast: boolean,
): TimetableRow {
  const primary = pickPrimaryStop(group, isFirst, isLast);
  const advertised = primary.advertisedTime ?? "";
  const estimatedRaw =
    primary.estimatedTime && primary.estimatedTime !== primary.advertisedTime
      ? primary.estimatedTime
      : group.find(
          (stop) =>
            stop.estimatedTime && stop.estimatedTime !== stop.advertisedTime,
        )?.estimatedTime;

  const advertisedClock = advertised ? formatStockholmClock(advertised) : "";
  const estimatedClock = estimatedRaw
    ? formatStockholmClock(estimatedRaw)
    : "";

  return {
    station: stationName(group[0]),
    advertisedTime: advertisedClock,
    estimatedTime:
      estimatedClock && estimatedClock !== advertisedClock
        ? estimatedClock
        : undefined,
    delayed: group.some((stop) => stop.delayed),
    canceled: group.some((stop) => stop.canceled),
    track: group.find((stop) => stop.track?.trim())?.track?.trim(),
    reason: group.find((stop) => stop.reason?.trim())?.reason?.trim(),
  };
}

export function collapseStops(
  stops: TrainStop[],
  preferredDateIso?: string,
): TimetableRow[] {
  const named = stops.filter((stop) => stationName(stop));
  const journey = pickJourney(splitJourneys(named), preferredDateIso);
  const groups = collapseConsecutive(journey);

  return groups.map((group, index) =>
    groupToRow(group, index === 0, index === groups.length - 1),
  );
}
