import { useEffect, useMemo, useRef } from "react";
import type { ParsedTrain } from "../api/trains";
import type { TrainJourney } from "../api/journey";
import { formatModifiedTime } from "../lib/formatTime";
import { collapseStops, type TimetableRow } from "../lib/timetable";

function rowMeta(row: TimetableRow): string {
  const parts: string[] = [];
  if (row.track) parts.push(`Spår ${row.track}`);
  if (row.canceled) parts.push("Inställt");
  else if (row.delayed) parts.push("Försenat");
  if (row.reason) parts.push(row.reason);
  return parts.join(" · ");
}

type TrainPanelProps = {
  train: ParsedTrain;
  details: TrainJourney | null;
  loading: boolean;
  notFound: boolean;
  error: string | null;
  onClose: () => void;
};

export function TrainPanel({
  train,
  details,
  loading,
  notFound,
  error,
  onClose,
}: TrainPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const rows = useMemo(
    () =>
      details
        ? collapseStops(details.stops, train.operationalTrainDepartureDate)
        : [],
    [details, train.operationalTrainDepartureDate],
  );

  useEffect(() => {
    closeRef.current?.focus();
  }, [train.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const operator = details?.operator?.trim() || train.operator?.trim();
  const fromName =
    rows[0]?.station ||
    details?.fromName?.trim() ||
    train.fromName?.trim();
  const toName =
    rows[rows.length - 1]?.station ||
    details?.toName?.trim() ||
    train.toName?.trim();
  const route =
    fromName && toName && fromName !== toName
      ? `${fromName} → ${toName}`
      : fromName || toName;
  const canceled = details?.canceled === true;

  return (
    <aside
      className="fixed inset-x-0 bottom-0 z-[1100] flex max-h-[90dvh] flex-col rounded-t-xl bg-white text-gray-900 shadow-[0_-4px_24px_rgba(17,24,39,0.18)] md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[22.5rem] md:rounded-none md:shadow-[-4px_0_24px_rgba(17,24,39,0.12)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="train-panel-title"
    >
      <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-gray-300 md:hidden" />

      <header className="flex items-start gap-3 border-b border-gray-200 px-4 pt-3 pb-3 md:pt-4">
        <div className="min-w-0 flex-1">
          <h2
            id="train-panel-title"
            className="m-0 text-lg font-semibold tracking-tight"
          >
            Tåg {train.advertisedTrainNumber}
          </h2>
          {operator ? (
            <p className="mt-0.5 mb-0 text-sm text-gray-700">{operator}</p>
          ) : null}
          {route ? (
            <p className="mt-0.5 mb-0 text-sm text-gray-700">{route}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            {canceled ? (
              <span className="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-800">
                Inställt
              </span>
            ) : null}
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
              {train.active ? "Aktivt" : "Inaktivt"}
            </span>
            {train.modifiedTime ? (
              <span className="text-gray-500">
                Position {formatModifiedTime(train.modifiedTime)}
              </span>
            ) : null}
          </div>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg leading-none text-gray-600 hover:bg-gray-100"
          aria-label="Stäng"
        >
          ×
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {loading ? (
          <p className="m-0 text-sm text-gray-600">Hämtar tidtabell…</p>
        ) : null}

        {!loading && notFound ? (
          <p className="m-0 text-sm text-gray-600">Ingen tidtabell hittades</p>
        ) : null}

        {!loading && error ? (
          <p className="m-0 text-sm text-red-700">{error}</p>
        ) : null}

        {!loading && details && rows.length === 0 ? (
          <p className="m-0 text-sm text-gray-600">Ingen tidtabell hittades</p>
        ) : null}

        {!loading && rows.length > 0 ? (
          <ol className="m-0 list-none p-0">
            {rows.map((row, index) => (
              <li
                key={`${row.station}-${index}`}
                className={`flex items-start justify-between gap-3 border-b border-gray-100 py-2.5 last:border-b-0 ${
                  row.canceled ? "text-red-800" : row.delayed ? "text-amber-800" : ""
                }`}
              >
                <div className="min-w-0">
                  <p
                    className={`m-0 text-sm font-medium ${
                      row.canceled ? "line-through" : ""
                    }`}
                  >
                    {row.station}
                  </p>
                  {rowMeta(row) ? (
                    <p className="m-0 mt-0.5 text-xs text-gray-500">
                      {rowMeta(row)}
                    </p>
                  ) : null}
                </div>
                <div className="shrink-0 text-right tabular-nums">
                  <p
                    className={`m-0 text-sm ${
                      row.canceled ? "line-through" : "font-medium"
                    }`}
                  >
                    {row.advertisedTime || "–"}
                  </p>
                  {row.estimatedTime ? (
                    <p className="m-0 text-xs font-medium text-amber-800">
                      ber. {row.estimatedTime}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </aside>
  );
}
