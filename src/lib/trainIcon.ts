import L from "leaflet";
import { operatorBadge } from "./operator";

export type MarkerSize = {
  disc: number;
  hit: number;
};

export function markerSizeForZoom(zoom: number): MarkerSize {
  if (zoom >= 8) return { disc: 32, hit: 44 };
  if (zoom >= 6) return { disc: 28, hit: 42 };
  return { disc: 26, hit: 40 };
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const iconCache = new Map<string, L.DivIcon>();

export function trainDivIcon(options: {
  operator?: string;
  active: boolean;
  selected: boolean;
  disc: number;
  hit: number;
}): L.DivIcon {
  const badge = operatorBadge(options.operator, options.active);
  const key = [
    options.disc,
    options.hit,
    badge.code,
    badge.background,
    options.active ? "1" : "0",
    options.selected ? "1" : "0",
  ].join("|");

  const cached = iconCache.get(key);
  if (cached) return cached;

  const fontSize =
    badge.code.length >= 4 ? 7 : badge.code.length === 3 ? 8 : 10;
  const selectedClass = options.selected ? " is-selected" : "";
  const inactiveClass = options.active ? "" : " is-inactive";

  const icon = L.divIcon({
    className: `train-marker-icon${selectedClass}`,
    iconSize: [options.hit, options.hit],
    iconAnchor: [options.hit / 2, options.hit / 2],
    html: `<div class="train-hit" style="width:${options.hit}px;height:${options.hit}px">
      <div class="train-disc${selectedClass}${inactiveClass}" style="width:${options.disc}px;height:${options.disc}px;background:${badge.background};color:${badge.color};font-size:${fontSize}px">${escapeHtml(badge.code)}</div>
    </div>`,
  });

  iconCache.set(key, icon);
  return icon;
}
