import { formatStockholm } from "../lib/formatTime";
import { UNKNOWN_OPERATOR } from "../lib/filters";
import { operatorBadge, operatorCode } from "../lib/operator";

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
}: StatusOverlayProps) {
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
      className="absolute top-3 left-3 z-[1000] w-[min(20rem,calc(100vw-1.5rem))] rounded-[10px] bg-white/95 px-3.5 py-3 text-gray-900 shadow-[0_1px_8px_rgba(17,24,39,0.18)]"
      aria-live="polite"
    >
      <h1 className="m-0 mb-1.5 text-[1.05rem] font-semibold tracking-tight">
        tågkarta
      </h1>
      <p className="m-0 text-sm leading-snug">{countLabel}</p>
      {updatedAt ? (
        <p className="m-0 text-sm leading-snug">
          Uppdaterad {formatStockholm(updatedAt)}
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 mb-0 text-sm leading-snug text-red-700">{error}</p>
      ) : null}

      <div className="mt-2.5 flex flex-col gap-2">
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
    </aside>
  );
}
