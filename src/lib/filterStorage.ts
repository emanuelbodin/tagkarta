import { UNKNOWN_OPERATOR } from "./filters";

const STORAGE_KEY = "tagkarta.filters";

const MAX_QUERY_LENGTH = 80;
const MAX_OPERATORS = 40;
const MAX_OPERATOR_LENGTH = 80;

export type StoredFilters = {
  numberQuery: string;
  selectedOperators: string[];
  showTracks: boolean;
  showDisruptions: boolean;
};

export const DEFAULT_FILTERS: StoredFilters = {
  numberQuery: "",
  selectedOperators: [],
  showTracks: true,
  showDisruptions: true,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeQuery(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.slice(0, MAX_QUERY_LENGTH);
}

function sanitizeOperators(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== "string") continue;
    const key = item.trim();
    if (!key || key.length > MAX_OPERATOR_LENGTH) continue;
    seen.add(key);
    if (seen.size >= MAX_OPERATORS) break;
  }
  return [...seen];
}

function sanitizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

/** Parse a localStorage payload. Invalid JSON or a non-object falls back entirely. */
export function parseStoredFilters(raw: string): StoredFilters {
  try {
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data)) return DEFAULT_FILTERS;
    return {
      numberQuery: sanitizeQuery(data.numberQuery),
      selectedOperators: sanitizeOperators(data.selectedOperators),
      showTracks: sanitizeBoolean(data.showTracks, DEFAULT_FILTERS.showTracks),
      showDisruptions: sanitizeBoolean(
        data.showDisruptions,
        DEFAULT_FILTERS.showDisruptions,
      ),
    };
  } catch {
    return DEFAULT_FILTERS;
  }
}

export function loadStoredFilters(): StoredFilters {
  try {
    if (typeof localStorage === "undefined") return DEFAULT_FILTERS;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FILTERS;
    return parseStoredFilters(raw);
  } catch {
    return DEFAULT_FILTERS;
  }
}

export function saveStoredFilters(filters: StoredFilters): void {
  try {
    if (typeof localStorage === "undefined") return;
    const payload: StoredFilters = {
      numberQuery: sanitizeQuery(filters.numberQuery),
      selectedOperators: sanitizeOperators(filters.selectedOperators),
      showTracks: filters.showTracks === true,
      showDisruptions: filters.showDisruptions === true,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Quota or private mode: in-memory filters still apply for this visit.
  }
}

/**
 * Operator keys that are not in the current snapshot (and "unknown" when no
 * train lacks an operator) do not filter and do not count as active.
 * Returns `selected` unchanged when every stored key still applies.
 */
export function applicableOperators(
  selected: ReadonlySet<string>,
  operatorOptions: readonly string[],
  unknownAvailable: boolean,
): ReadonlySet<string> {
  if (selected.size === 0) return selected;
  const known = new Set(operatorOptions);
  const next = new Set<string>();
  for (const key of selected) {
    if (key === UNKNOWN_OPERATOR) {
      if (unknownAvailable) next.add(key);
      continue;
    }
    if (known.has(key)) next.add(key);
  }
  if (next.size === selected.size) return selected;
  return next;
}
