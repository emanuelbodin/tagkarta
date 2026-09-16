import { useEffect, useState } from "react";

export type UserCoords = {
  lat: number;
  lon: number;
  accuracy: number | null;
};

export type UserLocationState = {
  coords: UserCoords | null;
  error: string | null;
};

const LOCATION_ERROR = "Kunde inte hämta din position";

export function useUserLocation(): UserLocationState {
  const [coords, setCoords] = useState<UserCoords | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError(LOCATION_ERROR);
      return;
    }

    let watchId: number | null = null;
    try {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const accuracy = pos.coords.accuracy;
          setCoords({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: Number.isFinite(accuracy) ? accuracy : null,
          });
          setError(null);
        },
        () => {
          setError(LOCATION_ERROR);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10_000,
          timeout: 20_000,
        },
      );
    } catch {
      setError(LOCATION_ERROR);
    }

    return () => {
      if (watchId != null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return { coords, error };
}
