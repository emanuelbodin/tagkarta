import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
  ZoomControl,
} from "react-leaflet";
import type { ParsedTrain } from "../api/trains";
import { TrainPopup } from "./TrainPopup";

const SWEDEN_CENTER: [number, number] = [62.0, 15.5];
const SWEDEN_ZOOM = 5;

function markerPath(active: boolean) {
  return {
    color: "#ffffff",
    weight: 1.5,
    fillColor: active ? "#0b6bcb" : "#6b7280",
    fillOpacity: 0.95,
  };
}

export function TrainMap({ trains }: { trains: ParsedTrain[] }) {
  return (
    <MapContainer
      center={SWEDEN_CENTER}
      zoom={SWEDEN_ZOOM}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <ZoomControl position="topright" />
      {trains.map((train) => (
        <CircleMarker
          key={train.id}
          center={[train.lat, train.lon]}
          radius={6}
          pathOptions={markerPath(train.active)}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
            {train.advertisedTrainNumber}
          </Tooltip>
          <Popup>
            <TrainPopup train={train} />
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
