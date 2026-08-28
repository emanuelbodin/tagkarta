import type { ParsedDisruption } from "../api/disruptions";
import { formatModifiedTime } from "../lib/formatTime";

function formatWhen(start?: string, end?: string): string | null {
  if (start && end) {
    return `${formatModifiedTime(start)} – ${formatModifiedTime(end)}`;
  }
  if (start) return `Från ${formatModifiedTime(start)}`;
  if (end) return `Till ${formatModifiedTime(end)}`;
  return null;
}

export function DisruptionPopupList({
  stationName,
  disruptions,
}: {
  stationName: string;
  disruptions: ParsedDisruption[];
}) {
  return (
    <div className="disruption-popup">
      <h3 className="disruption-popup-station">{stationName}</h3>
      <ul className="disruption-popup-list">
        {disruptions.map((item) => {
          const when = formatWhen(item.startTime, item.endTime);
          const trains =
            item.trains.length > 0 ? `Tåg ${item.trains.join(", ")}` : null;
          return (
            <li key={item.id} className="disruption-popup-item">
              {item.header ? (
                <p className="disruption-popup-header">{item.header}</p>
              ) : null}
              {item.description ? (
                <p className="disruption-popup-body">{item.description}</p>
              ) : null}
              {item.reason ? (
                <p className="disruption-popup-meta">{item.reason}</p>
              ) : null}
              {trains ? (
                <p className="disruption-popup-meta">{trains}</p>
              ) : null}
              {when ? (
                <p className="disruption-popup-meta">{when}</p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
