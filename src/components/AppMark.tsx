/** Circular tågkarta mascot in the map’s upper-right (away from overlay + zoom). */
export function AppMark() {
  return (
    <div
      className="pointer-events-none absolute top-3 right-3 z-[400] size-14 overflow-hidden rounded-full shadow-[0_1px_8px_rgba(17,24,39,0.22)] md:size-16"
      aria-hidden="true"
    >
      <img src="/logo.png" alt="" className="size-full object-cover" />
    </div>
  );
}
