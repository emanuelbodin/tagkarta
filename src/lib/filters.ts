import type { ParsedTrain } from "../api/trains";
import { operatorCode } from "./operator";

export const UNKNOWN_OPERATOR = "__unknown__";

export function matchesTrainNumber(
  train: ParsedTrain,
  query: string,
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    train.advertisedTrainNumber.toLowerCase().includes(needle) ||
    train.operationalTrainNumber.toLowerCase().includes(needle)
  );
}

export function matchesOperatorFilter(
  train: ParsedTrain,
  selected: ReadonlySet<string>,
): boolean {
  if (selected.size === 0) return true;
  const raw = train.operator?.trim();
  if (!raw) return selected.has(UNKNOWN_OPERATOR);
  return selected.has(raw);
}

export function filterTrains(
  trains: ParsedTrain[],
  numberQuery: string,
  selectedOperators: ReadonlySet<string>,
): ParsedTrain[] {
  return trains.filter(
    (train) =>
      matchesTrainNumber(train, numberQuery) &&
      matchesOperatorFilter(train, selectedOperators),
  );
}

export function snapshotOperators(trains: ParsedTrain[]): string[] {
  const seen = new Set<string>();
  for (const train of trains) {
    const raw = train.operator?.trim();
    if (raw) seen.add(raw);
  }
  return [...seen].sort((a, b) =>
    operatorCode(a).localeCompare(operatorCode(b), "sv"),
  );
}

export function snapshotHasUnknownOperator(trains: ParsedTrain[]): boolean {
  return trains.some((train) => !train.operator?.trim());
}
