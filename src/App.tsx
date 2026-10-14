import { useCallback, useEffect, useMemo, useState } from "react";
import { StatusOverlay } from "./components/StatusOverlay";
import { TrainMap } from "./components/TrainMap";
import { TrainPanel } from "./components/TrainPanel";
import { useDisruptions } from "./hooks/useDisruptions";
import { useOperatorMemory } from "./hooks/useOperatorMemory";
import { useStations } from "./hooks/useStations";
import { useTrainDetails } from "./hooks/useTrainDetails";
import { useTrainPositions } from "./hooks/useTrainPositions";
import { useUserLocation } from "./hooks/useUserLocation";
import type { ParsedTrain } from "./api/trains";
import {
  filterTrains,
  snapshotHasUnknownOperator,
  snapshotOperators,
} from "./lib/filters";
import {
  applicableOperators,
  loadStoredFilters,
  saveStoredFilters,
} from "./lib/filterStorage";
import { groupDisruptionsByStation } from "./lib/disruptionStations";

export default function App() {
  const { trains, updatedAt, error, loading } = useTrainPositions();
  const { bySignature: stationsBySignature, error: stationsError } =
    useStations();
  const [selected, setSelected] = useState<ParsedTrain | null>(null);
  const [storedFilters] = useState(() => loadStoredFilters());
  const [numberQuery, setNumberQuery] = useState(storedFilters.numberQuery);
  const [selectedOperators, setSelectedOperators] = useState<Set<string>>(
    () => new Set(storedFilters.selectedOperators),
  );
  const [showTracks, setShowTracks] = useState(storedFilters.showTracks);
  const [showDisruptions, setShowDisruptions] = useState(
    storedFilters.showDisruptions,
  );
  const { disruptions, error: disruptionsError } =
    useDisruptions(showDisruptions);
  const { coords: userLocation, error: locationError } = useUserLocation();

  const { details, loading: detailsLoading, error: detailsError, notFound } =
    useTrainDetails(selected?.advertisedTrainNumber ?? null);

  const trainsWithOperators = useOperatorMemory(
    trains,
    selected,
    details?.operator,
  );

  const operatorOptions = useMemo(
    () => snapshotOperators(trainsWithOperators),
    [trainsWithOperators],
  );
  const unknownOperatorAvailable = useMemo(
    () => snapshotHasUnknownOperator(trainsWithOperators),
    [trainsWithOperators],
  );
  const appliedOperators = useMemo(
    () =>
      applicableOperators(
        selectedOperators,
        operatorOptions,
        unknownOperatorAvailable,
      ),
    [selectedOperators, operatorOptions, unknownOperatorAvailable],
  );

  const visibleTrains = useMemo(
    () => filterTrains(trainsWithOperators, numberQuery, appliedOperators),
    [trainsWithOperators, numberQuery, appliedOperators],
  );

  useEffect(() => {
    saveStoredFilters({
      numberQuery,
      selectedOperators: [...selectedOperators],
      showTracks,
      showDisruptions,
    });
  }, [numberQuery, selectedOperators, showTracks, showDisruptions]);

  const disruptionGroups = useMemo(
    () => groupDisruptionsByStation(disruptions, stationsBySignature),
    [disruptions, stationsBySignature],
  );

  const disruptionsNote = showDisruptions
    ? disruptionsError ??
      (disruptions.length > 0 && stationsError ? stationsError : null)
    : null;

  const panelTrain = useMemo(() => {
    if (!selected) return null;
    return visibleTrains.find((train) => train.id === selected.id) ?? null;
  }, [selected, visibleTrains]);

  useEffect(() => {
    if (selected && !visibleTrains.some((train) => train.id === selected.id)) {
      setSelected(null);
    }
  }, [selected, visibleTrains]);

  const onSelect = useCallback((train: ParsedTrain) => {
    setSelected(train);
  }, []);

  const onDeselect = useCallback(() => {
    setSelected(null);
  }, []);

  const onToggleOperator = useCallback((key: string) => {
    setSelectedOperators((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const onClearFilters = useCallback(() => {
    setNumberQuery("");
    setSelectedOperators(new Set());
  }, []);

  return (
    <div className="relative h-full w-full">
      <TrainMap
        trains={visibleTrains}
        selectedId={panelTrain?.id ?? null}
        showTracks={showTracks}
        disruptionGroups={disruptionGroups}
        showDisruptions={showDisruptions}
        userLocation={userLocation}
        locationError={locationError}
        onSelect={onSelect}
        onDeselect={onDeselect}
      />
      <StatusOverlay
        filteredCount={visibleTrains.length}
        totalCount={trainsWithOperators.length}
        updatedAt={updatedAt}
        error={error}
        loading={loading}
        numberQuery={numberQuery}
        onNumberQueryChange={setNumberQuery}
        operatorOptions={operatorOptions}
        unknownOperatorAvailable={unknownOperatorAvailable}
        selectedOperators={appliedOperators}
        onToggleOperator={onToggleOperator}
        onClearFilters={onClearFilters}
        showTracks={showTracks}
        onToggleTracks={() => setShowTracks((on) => !on)}
        showDisruptions={showDisruptions}
        onToggleDisruptions={() => setShowDisruptions((on) => !on)}
        disruptionsError={disruptionsNote}
        locationError={userLocation ? null : locationError}
      />
      {panelTrain ? (
        <TrainPanel
          train={panelTrain}
          details={details}
          loading={detailsLoading}
          notFound={notFound}
          error={detailsError}
          onClose={onDeselect}
        />
      ) : null}
    </div>
  );
}
