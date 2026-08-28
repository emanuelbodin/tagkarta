import { StatusOverlay } from "./components/StatusOverlay";
import { TrainMap } from "./components/TrainMap";
import { useTrainPositions } from "./hooks/useTrainPositions";

export default function App() {
  const { trains, updatedAt, error, loading } = useTrainPositions();

  return (
    <div className="relative h-full w-full">
      <TrainMap trains={trains} />
      <StatusOverlay
        count={trains.length}
        updatedAt={updatedAt}
        error={error}
        loading={loading}
      />
    </div>
  );
}
