import L from "leaflet";

let cached: L.DivIcon | null = null;

export function userLocationDivIcon(): L.DivIcon {
  if (cached) return cached;
  cached = L.divIcon({
    className: "user-location-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `<div class="user-location-hit" aria-hidden="true">
      <span class="user-location-pulse"></span>
      <span class="user-location-dot"></span>
    </div>`,
  });
  return cached;
}
