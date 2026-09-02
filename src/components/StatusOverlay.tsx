import { useEffect, useState } from "react";
import { formatStockholm } from "../lib/formatTime";
import { UNKNOWN_OPERATOR } from "../lib/filters";
import { operatorBadge, operatorCode } from "../lib/operator";
import { TrackLegend } from "./TrackLegend";

type StatusOverlayProps = {
  filteredCount: number;
  totalCount: number;
  updatedAt: Date | null;
  error: string | null;
  loading: boolean;
  numberQuery: string;
  onNumberQueryChange: (value: string) => void;
  operatorOptions: string[];
  unknownOperatorAvailable: boolean;
  selectedOperators: ReadonlySet<string>;
  onToggleOperator: (key: string) => void;
  onClearFilters: () => void;
  showTracks: boolean;
  onToggleTracks: () => void;
  showDisruptions: boolean;
  onToggleDisruptions: () => void;
  disruptionsError: string | null;
};

export function StatusOverlay({
  filteredCount,
  totalCount,
  updatedAt,
  error,
  loading,
  numberQuery,
  onNumberQueryChange,
  operatorOptions,
  unknownOperatorAvailable,
  selectedOperators,
  onToggleOperator,
  onClearFilters,
  showTracks,
  onToggleTracks,
  showDisruptions,
  onToggleDisruptions,
  disruptionsError,
}: StatusOverlayProps) {
  const [legendOpen, setLegendOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);

  useEffect(() => {
    if (!showTracks) setLegendOpen(false);
  }, [showTracks]);

  const filtersActive =
    numberQuery.trim() !== "" || selectedOperators.size > 0;
  const countLabel = loading && !updatedAt
    ? "Hämtar tåg…"
    : !updatedAt
      ? "Inga tåg att visa"
      : filtersActive
        ? `${filteredCount} av ${totalCount} tåg`
        : `${totalCount} tåg`;

  const showOperatorRow = operatorOptions.length > 0;

  return (
    <aside
      className="absolute top-3 left-3 z-[1000] flex max-h-[calc(100dvh-1.5rem)] w-[min(20rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[10px] bg-white/95 px-3.5 py-3 text-gray-900 shadow-[0_1px_8px_rgba(17,24,39,0.18)]"
      aria-live="polite"
    >
      <div className="shrink-0">
        <div className="mb-1.5 flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt=""
            className="size-11 shrink-0 rounded-full object-cover shadow-[0_1px_4px_rgba(17,24,39,0.18)]"
          />
          <h1 className="m-0 text-[1.05rem] font-semibold tracking-tight">
            tågkarta
          </h1>
        </div>
        <p className="m-0 text-sm leading-snug">{countLabel}</p>
        {updatedAt ? (
          <p className="m-0 text-sm leading-snug">
            Uppdaterad {formatStockholm(updatedAt)}
          </p>
        ) : null}
        {error ? (
          <p className="mt-2 mb-0 text-sm leading-snug text-red-700">{error}</p>
        ) : null}
        {disruptionsError ? (
          <p className="mt-2 mb-0 text-xs leading-snug text-amber-800">
            {disruptionsError}
          </p>
        ) : null}

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showTracks}
              onChange={onToggleTracks}
              className="size-3.5 accent-sky-700"
              aria-label="Visa järnvägsspår"
            />
            Spår
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showDisruptions}
              onChange={onToggleDisruptions}
              className="size-3.5 accent-amber-600"
              aria-label="Visa störningar"
            />
            Störningar
          </label>
          {showTracks ? (
            <button
              type="button"
              aria-expanded={legendOpen}
              aria-controls="track-legend"
              onClick={() => setLegendOpen((open) => !open)}
              className="text-xs font-medium text-sky-800 underline-offset-2 hover:underline"
            >
              Teckenförklaring
            </button>
          ) : null}
          <button
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="overlay-filters"
            onClick={() => setFiltersOpen((open) => !open)}
            className="ml-auto flex items-center gap-1 rounded-md px-1 py-0.5 text-sm font-medium text-gray-800 hover:bg-gray-100"
          >
            {filtersActive ? (
              <span
                className="size-1.5 shrink-0 rounded-full bg-sky-700"
                aria-hidden="true"
              />
            ) : null}
            Sök
            <svg
              viewBox="0 0 12 12"
              className={`size-3 shrink-0 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            >
              <path
                d="M2.5 4.5 L6 8 L9.5 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {filtersActive ? (
              <span className="sr-only"> (filter aktiva)</span>
            ) : null}
          </button>
        </div>
      </div>

      {(showTracks && legendOpen) || filtersOpen ? (
        <div className="mt-2 flex min-h-0 flex-col gap-2 overflow-y-auto overscroll-contain">
          {showTracks && legendOpen ? (
            <div id="track-legend">
              <TrackLegend />
            </div>
          ) : null}
          {filtersOpen ? (
            <div id="overlay-filters" className="flex flex-col gap-2">
            <label className="block">
              <span className="sr-only">Filtrera på tågnummer</span>
              <input
                type="search"
                value={numberQuery}
                onChange={(event) => onNumberQueryChange(event.target.value)}
                placeholder="Tågnummer"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="search"
                className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-sky-600"
              />
            </label>

            {showOperatorRow ? (
              <div>
                <p className="m-0 mb-1 text-xs text-gray-500">Bolag</p>
                <div className="flex max-h-24 flex-wrap gap-1 overflow-y-auto">
                  {operatorOptions.map((raw) => {
                    const badge = operatorBadge(raw, true);
                    const selected = selectedOperators.has(raw);
                    return (
                      <button
                        key={raw}
                        type="button"
                        onClick={() => onToggleOperator(raw)}
                        aria-pressed={selected}
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          selected
                            ? "ring-2 ring-offset-1 ring-gray-900"
                            : "border border-gray-300 bg-white text-gray-800"
                        }`}
                        style={
                          selected
                            ? {
                                background: badge.background,
                                color: badge.color,
                                borderColor: badge.background,
                              }
                            : undefined
                        }
                      >
                        {operatorCode(raw)}
                      </button>
                    );
                  })}
                  {unknownOperatorAvailable ? (
                    <button
                      type="button"
                      onClick={() => onToggleOperator(UNKNOWN_OPERATOR)}
                      aria-pressed={selectedOperators.has(UNKNOWN_OPERATOR)}
                      className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                        selectedOperators.has(UNKNOWN_OPERATOR)
                          ? "border-gray-700 bg-gray-700 text-white"
                          : "border-gray-300 bg-white text-gray-800"
                      }`}
                    >
                      Okänt bolag
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="m-0 text-xs text-gray-500">
                Bolagsfilter när datan innehåller operator
              </p>
            )}

            {filtersActive ? (
              <button
                type="button"
                onClick={onClearFilters}
                className="self-start text-xs font-medium text-sky-800 underline-offset-2 hover:underline"
              >
                Rensa filter
              </button>
            ) : null}
          </div>
        ) : null}
        </div>
      ) : null}
    </aside>
  );
}
