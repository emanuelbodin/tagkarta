# AGENTS.md

## Project

Vite + React + TypeScript + Tailwind CSS v4 + react-leaflet frontend. GitHub repo is `tagkarta`; product name in the UI is **tågkarta**. It shows live positions for all trains in Sweden on an OpenStreetMap map.

Frontend-only: no Node/Express backend, no CORS proxy service, no React Router. The browser never calls Trafikverket XML. All data is JSON from [trafikverket-api](https://github.com/emanuelbodin/trafikverket-api) at `https://trafikverket-api-production.up.railway.app/`. That repo owns the API contract — consume fields as-is; do not invent them.

No tests, linter, or formatter are configured.

## Setup

```bash
npm ci
npm run dev          # Vite, usually http://localhost:5173
npm run build        # tsc -b && vite build → dist/
PORT=3000 npm start  # serve dist on 0.0.0.0:$PORT (Railway)
```

- Package manager is npm (`package-lock.json`).
- Dev: Vite proxies `/api` → `https://trafikverket-api-production.up.railway.app/api` (`vite.config.ts`).
- Production build calls the Railway origin directly. That API must send CORS (`Access-Control-Allow-Origin` for this origin, or `*`). Do not add a backend to work around CORS.
- Railway/Nixpacks: build `npm run build`, start `npm start`. `serve -s dist` rewrites unknown paths to `index.html`. No Dockerfile.

## Commands

| Task | Command |
|------|---------|
| Dev | `npm run dev` |
| Typecheck + production bundle | `npm run build` |
| Serve `dist` | `PORT=3000 npm start` |

## Layout

```
src/main.tsx                 # React mount
src/App.tsx                  # poll hook + selection + panel
src/index.css                # Tailwind + Leaflet + marker discs + heading chevron
src/api/trains.ts            # GET /api/train/position, WGS84 parse, optional snapshot fields
src/api/journey.ts           # GET /api/trains/:id
src/hooks/useTrainPositions.ts
src/hooks/useTrainDetails.ts # fetch only when a train is selected
src/hooks/useOperatorMemory.ts
src/components/TrainMap.tsx  # OSM + OpenRailwayMap overlay, DivIcon markers
src/components/TrainPanel.tsx
src/components/StatusOverlay.tsx
src/lib/filters.ts           # client-side number + operator matching
src/lib/timetable.ts         # collapse noisy stops into one row per station
src/lib/operator.ts          # short codes, disc colors, Commons logo paths
src/lib/heading.ts            # client-side bearing from successive positions
src/lib/trainIcon.ts
src/lib/formatTime.ts        # Europe/Stockholm
public/operators/            # Wikimedia Commons logos (letter fallback if missing)
vite.config.ts               # /api proxy (dev only)
```

## API contract to consume (do not invent fields)

Base: `https://trafikverket-api-production.up.railway.app/`  
Dev paths: `/api/...` via the Vite proxy. Prod: absolute Railway URLs (`import.meta.env.DEV` in `src/api/`).

- `GET /api/train/position` — JSON **array** of:

  ```
  {
    train: {
      operationalTrainNumber, operationalTrainDepartureDate,
      journeyPlanNumber, journeyPlanDepartureDate,
      advertisedTrainNumber
    },
    position: { wgs84 },   // typically "POINT (lon lat)" → Leaflet [lat, lon]
    status: { active },
    modifiedTime
  }
  ```

  Optional, omit-safe (top-level or under `train`): `operator`, `fromName`, `toName`. Optional top-level `speed` (number); missing is fine. Skip records with unparseable geometry. Do not fake positions on fetch failure; show Swedish error copy in the overlay. Heading is not on the DTO — derive it in `src/lib/heading.ts` from previous lat/lon across polls.

- `GET /api/trains/:id` — `:id` is `advertisedTrainNumber`. JSON:

  ```
  { id, operator, fromName, toName, canceled, stops[] }
  ```

  Stop rows are noisy (duplicate arrival/departure, empty names). Collapse in `src/lib/timetable.ts`. 404: still show the panel with number + last known position and “Ingen tidtabell hittades”. **Fetch only for the selected train.** Never N+1 this for the map.

- Later / not v1: SSE `GET /api/positions/stream`, `GET /api/trains/:id/position`. Do not implement unless asked.

## Conventions

- Swedish UI copy. English README and this file.
- Default map: Sweden (`center ~[62.0, 15.5]`, zoom `~5`). User can pan/zoom. Do not filter to a corridor. Overlay filters (train number substring, operator chips from the current snapshot) are client-side only; empty filters show every train. Do not add API query params or N+1 fetches for filtering.
- Poll positions every `POLL_MS` (3s) in `useTrainPositions`. Marker identity: `operationalTrainNumber + operationalTrainDepartureDate` (fallback `advertisedTrainNumber`). Update markers in place; do not wipe the layer each poll.
- Operator badges: colored disc + short letters (`src/lib/operator.ts`). Use snapshot `operator` when present; otherwise copy from selected-train details. Do not fetch `/api/trains/:id` for every train. Marker discs use Wikimedia Commons logos in `public/operators/` (object-fit contain, light disc); keep letter-code fallback when the operator or file is missing (SKÅJ, NJ, unknown). Do not invent or generate logos. Heading chevron rotates with CSS and sits outside the disc; keep operator letters and logos upright. Hide the arrow until a significant move (~25 m at 3s polls); hide again when displacement is tiny (~12 m, GPS jitter) or `speed === 0`.
- Railway tracks: OpenRailwayMap `standard` tiles as a Leaflet overlay on OSM (default on, overlay toggle “Spår”). Do not fetch Trafikverket geometry or add a rail-network backend.
- Times in the UI: `Europe/Stockholm`.
- Do not add a backend, React Router (unless a task needs routes), or dummy trains.
- Prefer small React components and hooks over new frameworks. Keep `npm run build` succeeding.
