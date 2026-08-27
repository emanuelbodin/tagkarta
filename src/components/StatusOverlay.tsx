import { formatStockholm } from "../lib/formatTime";

type StatusOverlayProps = {
  count: number;
  updatedAt: Date | null;
  error: string | null;
  loading: boolean;
};

export function StatusOverlay({
  count,
  updatedAt,
  error,
  loading,
}: StatusOverlayProps) {
  const countLabel = loading && !updatedAt
    ? "Hämtar tåg…"
    : updatedAt
      ? `${count} tåg`
      : "Inga tåg att visa";

  return (
    <aside
      className="pointer-events-none absolute top-3 left-3 z-[1000] max-w-[min(17.5rem,calc(100vw-1.5rem))] rounded-[10px] bg-white/95 px-3.5 py-3 text-gray-900 shadow-[0_1px_8px_rgba(17,24,39,0.18)]"
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
    </aside>
  );
}
