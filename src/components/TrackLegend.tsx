import type { ReactNode } from "react";

const SAMPLE_W = 48;
const SAMPLE_H = 16;

export type LegendKind =
  | "bridge"
  | "tunnel"
  | "line-ref"
  | "rail"
  | "narrow-gauge"
  | "siding"
  | "yard-track"
  | "spur"
  | "crossover"
  | "branch"
  | "main"
  | "highspeed"
  | "industrial"
  | "industrial-service"
  | "preserved"
  | "construction"
  | "proposed"
  | "disused"
  | "abandoned"
  | "razed"
  | "subway"
  | "tram"
  | "station"
  | "yard-site";

type LegendItem = { kind: LegendKind; label: string };

type LegendGroup = { title: string; items: LegendItem[] };

const GROUPS: LegendGroup[] = [
  {
    title: "Spårtyp",
    items: [
      { kind: "bridge", label: "Bro" },
      { kind: "tunnel", label: "Tunnel" },
      { kind: "line-ref", label: "Linjenummer" },
      { kind: "rail", label: "Järnvägsspår" },
      { kind: "narrow-gauge", label: "Smalspår" },
    ],
  },
  {
    title: "Användning",
    items: [
      { kind: "siding", label: "Sidospår" },
      { kind: "yard-track", label: "Bangårdsspår" },
      { kind: "spur", label: "Stickspår" },
      { kind: "crossover", label: "Korsväxel" },
      { kind: "branch", label: "Grenlinje" },
      { kind: "main", label: "Huvudlinje" },
      { kind: "highspeed", label: "Höghastighet" },
      { kind: "industrial", label: "Industrispår" },
      { kind: "industrial-service", label: "Industriservice" },
      { kind: "preserved", label: "Museispår" },
      { kind: "construction", label: "Under byggnad" },
      { kind: "proposed", label: "Föreslagen" },
      { kind: "disused", label: "Ej i bruk" },
      { kind: "abandoned", label: "Övergiven" },
      { kind: "razed", label: "Riven" },
      { kind: "subway", label: "Tunnelbana" },
      { kind: "tram", label: "Spårväg" },
    ],
  },
  {
    title: "Driftplatser",
    items: [
      { kind: "station", label: "Station" },
      { kind: "yard-site", label: "Bangård" },
    ],
  },
];

function hashes(
  color: string,
  y = 8,
  step = 6,
  half = 3.5,
): ReactNode {
  const ticks = [];
  for (let x = 6; x <= 42; x += step) {
    ticks.push(
      <line
        key={x}
        x1={x}
        y1={y - half}
        x2={x}
        y2={y + half}
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="square"
      />,
    );
  }
  return ticks;
}

function LegendSwatch({ kind }: { kind: LegendKind }) {
  return (
    <svg
      width={SAMPLE_W}
      height={SAMPLE_H}
      viewBox={`0 0 ${SAMPLE_W} ${SAMPLE_H}`}
      aria-hidden="true"
      className="shrink-0"
    >
      {swatchGraphic(kind)}
    </svg>
  );
}

function swatchGraphic(kind: LegendKind): ReactNode {
  switch (kind) {
    case "bridge":
      return (
        <>
          <line
            x1="8"
            y1="8"
            x2="40"
            y2="8"
            stroke="#111827"
            strokeWidth="3.6"
            strokeLinecap="butt"
          />
          <line x1="8" y1="3" x2="8" y2="13" stroke="#111827" strokeWidth="2.4" />
          <line
            x1="40"
            y1="3"
            x2="40"
            y2="13"
            stroke="#111827"
            strokeWidth="2.4"
          />
        </>
      );
    case "tunnel":
      return (
        <>
          <line x1="2" y1="3.5" x2="46" y2="3.5" stroke="#9ca3af" strokeWidth="1.1" />
          <line x1="2" y1="12.5" x2="46" y2="12.5" stroke="#9ca3af" strokeWidth="1.1" />
          <line
            x1="6"
            y1="8"
            x2="42"
            y2="8"
            stroke="#9ca3af"
            strokeWidth="2"
            strokeDasharray="3.2 2.2"
          />
        </>
      );
    case "line-ref":
      return (
        <line
          x1="4"
          y1="8"
          x2="44"
          y2="8"
          stroke="#FF8100"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
      );
    case "rail":
      return (
        <line
          x1="4"
          y1="8"
          x2="44"
          y2="8"
          stroke="#111827"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      );
    case "narrow-gauge":
      return (
        <>
          <line x1="4" y1="8" x2="44" y2="8" stroke="#111827" strokeWidth="2" />
          {hashes("#111827", 8, 5.5, 3.2)}
        </>
      );
    case "siding":
      return (
        <line x1="4" y1="8" x2="44" y2="8" stroke="#111827" strokeWidth="2" />
      );
    case "yard-track":
      return (
        <line x1="4" y1="8" x2="44" y2="8" stroke="#111827" strokeWidth="1.5" />
      );
    case "spur":
      return (
        <line x1="4" y1="8" x2="44" y2="8" stroke="#87491D" strokeWidth="3" />
      );
    case "crossover":
      return (
        <line x1="4" y1="8" x2="44" y2="8" stroke="#111827" strokeWidth="1" />
      );
    case "branch":
      return (
        <line x1="4" y1="8" x2="44" y2="8" stroke="#DACA00" strokeWidth="3.2" />
      );
    case "main":
      return (
        <line x1="4" y1="8" x2="44" y2="8" stroke="#FF8100" strokeWidth="3.5" />
      );
    case "highspeed":
      return (
        <line x1="4" y1="8" x2="44" y2="8" stroke="#FF0C00" strokeWidth="3.5" />
      );
    case "industrial":
      return (
        <line x1="4" y1="8" x2="44" y2="8" stroke="#87491D" strokeWidth="2" />
      );
    case "industrial-service":
      return (
        <line x1="4" y1="8" x2="44" y2="8" stroke="#87491D" strokeWidth="1.4" />
      );
    case "preserved":
      return (
        <>
          <line x1="4" y1="8" x2="44" y2="8" stroke="#a8a29e" strokeWidth="2.2" />
          {hashes("#70584D", 8, 7, 4)}
        </>
      );
    case "construction":
      return (
        <line
          x1="4"
          y1="8"
          x2="44"
          y2="8"
          stroke="#111827"
          strokeWidth="3"
          strokeDasharray="7 2.4 1.6 2.4"
          strokeLinecap="butt"
        />
      );
    case "proposed":
      return (
        <line
          x1="4"
          y1="8"
          x2="44"
          y2="8"
          stroke="#111827"
          strokeWidth="3"
          strokeDasharray="1.4 3.2"
          strokeLinecap="round"
        />
      );
    case "disused":
      return (
        <line x1="4" y1="8" x2="44" y2="8" stroke="#4b5563" strokeWidth="3" />
      );
    case "abandoned":
      return (
        <line
          x1="4"
          y1="8"
          x2="44"
          y2="8"
          stroke="#4b5563"
          strokeWidth="3"
          strokeDasharray="4.5 3.5"
        />
      );
    case "razed":
      return (
        <line
          x1="4"
          y1="8"
          x2="44"
          y2="8"
          stroke="#d1d5db"
          strokeWidth="3"
          strokeDasharray="1.5 3.4"
          strokeLinecap="round"
        />
      );
    case "subway":
      return (
        <>
          <line
            x1="4"
            y1="8"
            x2="18"
            y2="8"
            stroke="#0300C3"
            strokeWidth="1.6"
            strokeLinecap="butt"
          />
          <line
            x1="18"
            y1="8"
            x2="44"
            y2="8"
            stroke="#93c5fd"
            strokeWidth="3.2"
            strokeLinecap="butt"
          />
        </>
      );
    case "tram":
      return (
        <line x1="4" y1="8" x2="44" y2="8" stroke="#00BD14" strokeWidth="2.5" />
      );
    case "station":
      return (
        <text
          x="24"
          y="12"
          textAnchor="middle"
          fill="#2563eb"
          fontSize="11"
          fontWeight="700"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          Cst
        </text>
      );
    case "yard-site":
      return (
        <text
          x="24"
          y="12"
          textAnchor="middle"
          fill="#87491D"
          fontSize="11"
          fontWeight="700"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          Gbf
        </text>
      );
  }
}

export function TrackLegend() {
  return (
    <div className="mt-1 rounded-md border border-gray-200 bg-white/90 px-2 py-1.5">
      <div className="max-h-[min(42vh,18rem)] overflow-y-auto overscroll-contain pr-0.5">
        {GROUPS.map((group) => (
          <section key={group.title} className="mb-2 last:mb-0">
            <h2 className="m-0 mb-1 text-[11px] font-semibold tracking-wide text-gray-600">
              {group.title}
            </h2>
            <ul className="m-0 list-none p-0">
              {group.items.map((item) => (
                <li
                  key={item.kind}
                  className="flex items-center gap-2 py-[3px] text-xs leading-none text-gray-800"
                >
                  <LegendSwatch kind={item.kind} />
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="m-0 mt-1.5 text-[10px] leading-snug text-gray-500">
        Stil:{" "}
        <a
          href="https://www.openrailwaymap.org/"
          target="_blank"
          rel="noreferrer"
          className="text-sky-800 underline-offset-2 hover:underline"
        >
          OpenRailwayMap
        </a>
      </p>
    </div>
  );
}
