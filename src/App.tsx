import { useCallback, useMemo, useState } from "react";
import { StatusOverlay } from "./components/StatusOverlay";
import { TrainMap } from "./components/TrainMap";
import { TrainPanel } from "./components/TrainPanel";
import { useTrainDetails } from "./hooks/useTrainDetails";
import { useTrainPositions } from "./hooks/useTrainPositions";
import type { ParsedTrain } from "./api/trains";

export default function App() {
  const { trains, updatedAt, error, loading } = useTrainPositions();
  const [selected, setSelected] = useState<ParsedTrain | null>(null);

  const panelTrain = useMemo(() => {
    if (!selected) return null;
    return trains.find((train) => train.id === selected.id) ?? selected;
  }, [selected, trains]);

  const { details, loading: detailsLoading, error: detailsError, notFound } =
    useTrainDetails(panelTrain?.advertisedTrainNumber ?? null);

  const onSelect = useCallback((train: ParsedTrain) => {
    setSelected(train);
  }, []);

  const onDeselect = useCallback(() => {
    setSelected(null);
  }, []);

  return (
    <div className="relative h-full w-full">
      <TrainMap
        trains={trains}
        selectedId={panelTrain?.id ?? null}
        onSelect={onSelect}
        onDeselect={onDeselect}
      />
      <StatusOverlay
        count={trains.length}
        updatedAt={updatedAt}
        error={error}
        loading={loading}
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
