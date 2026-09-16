import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import L from "leaflet";
import { useMap } from "react-leaflet";
import type { UserCoords } from "../hooks/useUserLocation";

const USER_LOCATION_ZOOM = 13;
const LABEL = "Centrera på min position";

function flyToUser(map: L.Map, coords: UserCoords) {
  const zoom = Math.max(map.getZoom(), USER_LOCATION_ZOOM);
  map.flyTo([coords.lat, coords.lon], zoom);
}

export function LocateControl({
  coords,
  locationError,
}: {
  coords: UserCoords | null;
  locationError: string | null;
}) {
  const map = useMap();
  const [pending, setPending] = useState(false);
  const [container] = useState(() => {
    const div = L.DomUtil.create(
      "div",
      "leaflet-bar leaflet-control locate-control",
    );
    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);
    return div;
  });

  const denied = locationError != null && coords == null;

  useEffect(() => {
    const control = new L.Control({ position: "bottomleft" });
    control.onAdd = () => container;
    control.addTo(map);
    return () => {
      control.remove();
    };
  }, [map, container]);

  useEffect(() => {
    if (!pending) return;
    if (coords) {
      setPending(false);
      flyToUser(map, coords);
    } else if (locationError) {
      setPending(false);
    }
  }, [coords, locationError, pending, map]);

  return createPortal(
    <button
      type="button"
      aria-label={LABEL}
      title={LABEL}
      aria-busy={pending || undefined}
      disabled={denied}
      className={[
        coords ? "has-fix" : "",
        pending ? "is-pending" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => {
        if (denied) return;
        if (coords) {
          setPending(false);
          flyToUser(map, coords);
          return;
        }
        setPending(true);
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 2a1 1 0 0 1 1 1v1.06A8.004 8.004 0 0 1 19.94 11H21a1 1 0 1 1 0 2h-1.06A8.004 8.004 0 0 1 13 19.94V21a1 1 0 1 1-2 0v-1.06A8.004 8.004 0 0 1 4.06 13H3a1 1 0 1 1 0-2h1.06A8.004 8.004 0 0 1 11 4.06V3a1 1 0 0 1 1-1zm0 5.5A4.5 4.5 0 1 0 12 16.5 4.5 4.5 0 0 0 12 7.5zm0 2A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5z"
        />
      </svg>
    </button>,
    container,
  );
}
