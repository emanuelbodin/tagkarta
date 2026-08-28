import L from "leaflet";
import { operatorBadge, operatorLogoSrc } from "./operator";

export type MarkerSize = {
  disc: number;
  hit: number;
};

export function markerSizeForZoom(zoom: number): MarkerSize {
  if (zoom >= 8) return { disc: 32, hit: 52 };
  if (zoom >= 6) return { disc: 28, hit: 50 };
  return { disc: 26, hit: 48 };
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const iconCache = new Map<string, L.DivIcon>();

function roundHeadingDeg(heading: number): number {
  return ((Math.round(heading / 5) * 5) % 360 + 360) % 360;
}

export function trainDivIcon(options: {
  operator?: string;
  active: boolean;
  selected: boolean;
  disc: number;
  hit: number;
  heading?: number;
}): L.DivIcon {
  const badge = operatorBadge(options.operator, options.active);
  const logoSrc = operatorLogoSrc(options.operator);
  const headingDeg =
    options.heading != null && Number.isFinite(options.heading)
      ? roundHeadingDeg(options.heading)
      : null;
  const key = [
    options.disc,
    options.hit,
    badge.code,
    badge.background,
    logoSrc ?? "-",
    options.active ? "1" : "0",
    options.selected ? "1" : "0",
    headingDeg == null ? "-" : String(headingDeg),
  ].join("|");

  const cached = iconCache.get(key);
  if (cached) return cached;

  const fontSize =
    badge.code.length >= 4 ? 7 : badge.code.length === 3 ? 8 : 10;
  const selectedClass = options.selected ? " is-selected" : "";
  const inactiveClass = options.active ? "" : " is-inactive";
  const logoClass = logoSrc ? " has-logo" : "";
  const arrowHtml =
    headingDeg == null
      ? ""
      : `<div class="train-heading" style="transform:rotate(${headingDeg}deg)"><svg class="train-arrow${selectedClass}" viewBox="0 0 14 12" aria-hidden="true" focusable="false"><polygon points="7,1 13,11 1,11"/></svg></div>`;
  const discInner = logoSrc
    ? `<img class="train-logo" src="${escapeHtml(logoSrc)}" alt="" draggable="false" decoding="async">`
    : escapeHtml(badge.code);
  const discStyle = logoSrc
    ? `width:${options.disc}px;height:${options.disc}px`
    : `width:${options.disc}px;height:${options.disc}px;background:${badge.background};color:${badge.color};font-size:${fontSize}px`;

  const icon = L.divIcon({
    className: `train-marker-icon${selectedClass}`,
    iconSize: [options.hit, options.hit],
    iconAnchor: [options.hit / 2, options.hit / 2],
    html: `<div class="train-hit" style="width:${options.hit}px;height:${options.hit}px">
      <div class="train-body" style="width:${options.disc}px;height:${options.disc}px">
        ${arrowHtml}
        <div class="train-disc${selectedClass}${inactiveClass}${logoClass}" style="${discStyle}">${discInner}</div>
      </div>
    </div>`,
  });

  iconCache.set(key, icon);
  return icon;
}
