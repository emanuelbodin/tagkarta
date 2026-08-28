import type { ParsedDisruption } from "../api/disruptions";
import type { StationRecord } from "../api/stations";

export type StationDisruptionGroup = {
  signature: string;
  name: string;
  lat: number;
  lon: number;
  disruptions: ParsedDisruption[];
};

export function groupDisruptionsByStation(
  disruptions: ParsedDisruption[],
  stations: Map<string, StationRecord>,
): StationDisruptionGroup[] {
  const groups = new Map<string, StationDisruptionGroup>();

  for (const disruption of disruptions) {
    const seen = new Set<string>();
    for (const affected of disruption.stations) {
      const signature = affected.signature.trim();
      if (!signature || seen.has(signature)) continue;
      seen.add(signature);

      const station = stations.get(signature);
      if (!station) continue;

      const existing = groups.get(signature);
      if (existing) {
        if (!existing.disruptions.some((item) => item.id === disruption.id)) {
          existing.disruptions.push(disruption);
        }
        continue;
      }

      groups.set(signature, {
        signature,
        name: affected.name?.trim() || station.name,
        lat: station.lat,
        lon: station.lon,
        disruptions: [disruption],
      });
    }
  }

  return [...groups.values()];
}
