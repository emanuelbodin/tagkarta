import { useEffect, useMemo, useRef } from "react";
import type { ParsedTrain } from "../api/trains";

export function useOperatorMemory(
  trains: ParsedTrain[],
  selected: ParsedTrain | null,
  detailsOperator: string | undefined,
): ParsedTrain[] {
  const cache = useRef(new Map<string, string>());

  useEffect(() => {
    const operator = detailsOperator?.trim();
    if (!selected || !operator) return;
    cache.current.set(selected.id, operator);
    cache.current.set(selected.advertisedTrainNumber, operator);
  }, [detailsOperator, selected]);

  return useMemo(() => {
    const remembered = cache.current;
    return trains.map((train) => {
      const operator =
        train.operator ??
        remembered.get(train.id) ??
        remembered.get(train.advertisedTrainNumber);
      return operator && operator !== train.operator
        ? { ...train, operator }
        : train;
    });
  }, [trains, detailsOperator, selected?.id]);
}
