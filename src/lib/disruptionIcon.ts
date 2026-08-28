import L from "leaflet";

const iconCache = new Map<string, L.DivIcon>();

export function disruptionDivIcon(count: number): L.DivIcon {
  const badge = count > 1 ? Math.min(count, 99) : 0;
  const key = String(badge);
  const cached = iconCache.get(key);
  if (cached) return cached;

  const countHtml =
    badge > 0
      ? `<span class="disruption-count">${badge}</span>`
      : "";

  const icon = L.divIcon({
    className: "disruption-marker-icon",
    iconSize: [28, 30],
    iconAnchor: [14, 30],
    popupAnchor: [0, -28],
    html: `<div class="disruption-hit" aria-hidden="true">
      <svg class="disruption-glyph" viewBox="0 0 24 24">
        <path d="M12 3.2 L22.2 21.2 H1.8 Z" fill="#f59e0b" stroke="#78350f" stroke-width="1.7" stroke-linejoin="round"/>
        <rect x="10.7" y="9.2" width="2.6" height="6.2" rx="0.6" fill="#78350f"/>
        <rect x="10.7" y="16.6" width="2.6" height="2.2" rx="0.6" fill="#78350f"/>
      </svg>
      ${countHtml}
    </div>`,
  });

  iconCache.set(key, icon);
  return icon;
}
