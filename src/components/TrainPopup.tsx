import type { ParsedTrain } from "../api/trains";
import { formatModifiedTime } from "../lib/formatTime";

export function TrainPopup({ train }: { train: ParsedTrain }) {
  const showOperational =
    train.operationalTrainNumber !== train.advertisedTrainNumber;

  return (
    <div>
      <p className="m-0 mb-1 font-semibold">Tåg {train.advertisedTrainNumber}</p>
      {showOperational ? (
        <p className="m-0 text-[0.85rem]">
          Operativt nummer: {train.operationalTrainNumber}
        </p>
      ) : null}
      <p className="m-0 text-[0.85rem]">
        {train.active ? "Aktivt" : "Inaktivt"}
      </p>
      <p className="m-0 text-[0.85rem]">
        Uppdaterad: {formatModifiedTime(train.modifiedTime)}
      </p>
    </div>
  );
}
