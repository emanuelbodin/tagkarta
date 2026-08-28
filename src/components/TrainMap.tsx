import { useRef, useState, type RefObject } from "react";
import { DomEvent } from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { ParsedTrain } from "../api/trains";
import { operatorBadge } from "../lib/operator";
import { markerSizeForZoom, trainDivIcon } from "../lib/trainIcon";

const SWEDEN_CENTER: [number, number] = [62.0, 15.5];
const SWEDEN_ZOOM = 5;

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

function TrainMarkers({
  trains,
  selectedId,
  ignoreNextMapClick,
  onSelect,
}: {
  trains: ParsedTrain[];
  selectedId: string | null;
  ignoreNextMapClick: RefObject<boolean>;
  onSelect: (train: ParsedTrain) => void;
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });
  const size = markerSizeForZoom(zoom);

  return (
    <>
      {trains.map((train) => {
        const selected = train.id === selectedId;
        const badge = operatorBadge(train.operator, train.active);
        const tooltip = badge.code
          ? `${train.advertisedTrainNumber} · ${badge.code}`
          : train.advertisedTrainNumber;

        return (
          <Marker
            key={train.id}
            position={[train.lat, train.lon]}
            icon={trainDivIcon({
              operator: train.operator,
              active: train.active,
              selected,
              disc: selected ? size.disc + 4 : size.disc,
              hit: size.hit,
            })}
            zIndexOffset={selected ? 1000 : 0}
            keyboard={false}
            eventHandlers={{
              click: (event) => {
                DomEvent.stop(event.originalEvent);
                ignoreNextMapClick.current = true;
                onSelect(train);
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -size.disc / 2 - 4]} opacity={0.95}>
              {tooltip}
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
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
      <TrainMarkers
        trains={trains}
        selectedId={selectedId}
        ignoreNextMapClick={ignoreNextMapClick}
        onSelect={onSelect}
      />
    </MapContainer>
  );
}
