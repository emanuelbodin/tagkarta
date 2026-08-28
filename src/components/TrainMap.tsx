import { useRef, useState, type RefObject } from "react";
import { DomEvent } from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { ParsedTrain } from "../api/trains";
import { DisruptionPopupList } from "./DisruptionPopup";
import { operatorBadge } from "../lib/operator";
import { disruptionDivIcon } from "../lib/disruptionIcon";
import type { StationDisruptionGroup } from "../lib/disruptionStations";
import { markerSizeForZoom, trainDivIcon } from "../lib/trainIcon";

const SWEDEN_CENTER: [number, number] = [62.0, 15.5];
const SWEDEN_ZOOM = 5;

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const OPENRAILWAYMAP_ATTRIBUTION =
  '<a href="https://www.openstreetmap.org/copyright">&copy; OpenStreetMap contributors</a>, Style: <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA 2.0</a> <a href="https://www.openrailwaymap.org/">OpenRailwayMap</a> and OpenStreetMap';

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
              heading: train.heading,
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

function DisruptionMarkers({
  groups,
  ignoreNextMapClick,
}: {
  groups: StationDisruptionGroup[];
  ignoreNextMapClick: RefObject<boolean>;
}) {
  return (
    <>
      {groups.map((group) => (
        <Marker
          key={group.signature}
          position={[group.lat, group.lon]}
          icon={disruptionDivIcon(group.disruptions.length)}
          zIndexOffset={-40}
          keyboard={false}
          eventHandlers={{
            click: (event) => {
              DomEvent.stop(event.originalEvent);
              ignoreNextMapClick.current = true;
            },
          }}
        >
          <Tooltip direction="top" offset={[0, -28]} opacity={0.95}>
            {group.disruptions.length > 1
              ? `${group.name} · ${group.disruptions.length} störningar`
              : group.name}
          </Tooltip>
          <Popup
            className="disruption-leaflet-popup"
            maxWidth={280}
            minWidth={200}
            autoPanPadding={[60, 60]}
          >
            <DisruptionPopupList
              stationName={group.name}
              disruptions={group.disruptions}
            />
          </Popup>
        </Marker>
      ))}
    </>
  );
}

type TrainMapProps = {
  trains: ParsedTrain[];
  selectedId: string | null;
  showTracks: boolean;
  disruptionGroups: StationDisruptionGroup[];
  showDisruptions: boolean;
  onSelect: (train: ParsedTrain) => void;
  onDeselect: () => void;
};

export function TrainMap({
  trains,
  selectedId,
  showTracks,
  disruptionGroups,
  showDisruptions,
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
        attribution={OSM_ATTRIBUTION}
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      {showTracks ? (
        <TileLayer
          attribution={OPENRAILWAYMAP_ATTRIBUTION}
          url="https://tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
          minZoom={2}
          maxZoom={19}
          tileSize={256}
        />
      ) : null}
      <ZoomControl position="bottomleft" />
      <MapBackgroundClick
        enabled={selectedId != null}
        ignoreNextClick={ignoreNextMapClick}
        onDeselect={onDeselect}
      />
      {showDisruptions ? (
        <DisruptionMarkers
          groups={disruptionGroups}
          ignoreNextMapClick={ignoreNextMapClick}
        />
      ) : null}
      <TrainMarkers
        trains={trains}
        selectedId={selectedId}
        ignoreNextMapClick={ignoreNextMapClick}
        onSelect={onSelect}
      />
    </MapContainer>
  );
}
