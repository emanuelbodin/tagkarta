export type OperatorBadge = {
  code: string;
  background: string;
  color: string;
};

const KNOWN_OPERATORS: Record<string, OperatorBadge> = {
  SJ: { code: "SJ", background: "#1e3a8a", color: "#ffffff" },
  ARRIVA: { code: "AR", background: "#0f766e", color: "#ffffff" },
  SLL: { code: "SL", background: "#4f46e5", color: "#ffffff" },
  SL: { code: "SL", background: "#4f46e5", color: "#ffffff" },
  VY: { code: "VY", background: "#9f1239", color: "#ffffff" },
  MTRX: { code: "MTRX", background: "#701a75", color: "#ffffff" },
  TDEV: { code: "TD", background: "#b45309", color: "#ffffff" },
};

const NEUTRAL: OperatorBadge = {
  code: "",
  background: "#334155",
  color: "#ffffff",
};

const ACTIVE_FALLBACK = "#0b6bcb";
const INACTIVE_FALLBACK = "#6b7280";

function normalizeOperator(name: string): string {
  return name.trim().toUpperCase();
}

export function operatorCode(name: string): string {
  const key = normalizeOperator(name);
  const known = KNOWN_OPERATORS[key];
  if (known) return known.code;

  const letters = key.replace(/[^A-ZÅÄÖ]/g, "");
  if (letters.length <= 3) return letters || key.slice(0, 3);
  return letters.slice(0, 3);
}

export function operatorBadge(
  operator: string | undefined,
  active: boolean,
): OperatorBadge {
  if (!operator?.trim()) {
    return {
      code: "",
      background: active ? ACTIVE_FALLBACK : INACTIVE_FALLBACK,
      color: "#ffffff",
    };
  }

  const key = normalizeOperator(operator);
  const known = KNOWN_OPERATORS[key];
  if (known) return known;

  return {
    ...NEUTRAL,
    code: operatorCode(operator),
  };
}
