import { useRef, type RefObject } from "react";
import { DomEvent } from "leaflet";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMapEvents,
} from "react-leaflet";
import type { ParsedTrain } from "../api/trains";

const SWEDEN_CENTER: [number, number] = [62.0, 15.5];
const SWEDEN_ZOOM = 5;

function markerPath(active: boolean, selected: boolean) {
  return {
    color: "#ffffff",
    weight: selected ? 2 : 1.5,
    fillColor: selected ? "#c2410c" : active ? "#0b6bcb" : "#6b7280",
    fillOpacity: 0.95,
  };
}

function MapBackgroundClick({
  enabled,
  ignoreNextClick,
  onDeselect,
}: {
  enabled: boolean;
  ignoreNextClick: RefObject<boolean>;
  onDeselect: () => void;
}) {
  useMapEvents({
    click: () => {
      if (ignoreNextClick.current) {
        ignoreNextClick.current = false;
        return;
      }
      if (enabled) onDeselect();
    },
  });
  return null;
}

type TrainMapProps = {
  trains: ParsedTrain[];
  selectedId: string | null;
  onSelect: (train: ParsedTrain) => void;
  onDeselect: () => void;
};

export function TrainMap({
  trains,
  selectedId,
  onSelect,
  onDeselect,
}: TrainMapProps) {
  const ignoreNextMapClick = useRef(false);

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
      <ZoomControl position="bottomleft" />
      <MapBackgroundClick
        enabled={selectedId != null}
        ignoreNextClick={ignoreNextMapClick}
        onDeselect={onDeselect}
      />
      {trains.map((train) => {
        const selected = train.id === selectedId;
        return (
          <CircleMarker
            key={train.id}
            center={[train.lat, train.lon]}
            radius={selected ? 8 : 6}
            pathOptions={markerPath(train.active, selected)}
            eventHandlers={{
              click: (event) => {
                DomEvent.stop(event.originalEvent);
                ignoreNextMapClick.current = true;
                onSelect(train);
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
              {train.advertisedTrainNumber}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
