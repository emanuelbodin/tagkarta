# tågkarta

Live map of trains in Sweden. Positions are fetched as JSON from the wrapper API — the client does not call Trafikverket directly.

Click a train to open a side panel with operator, route, and timetable (`GET /api/trains/:id` for the selected advertised train number only).

Markers are larger discs with a padded hit target so they are easier to click at Sweden-wide zoom. If the position snapshot includes `operator` (top-level or under `train`), the disc shows a short operator code and color. Selecting a train also copies the operator from the details response onto that marker — the app does not fetch details for every train.

## Setup

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). In development, `/api` is proxied to the API so local CORS is not required.

## Build

```bash
npm run build
```

The production build calls the Railway origin directly.

## API

- Base URL: https://trafikverket-api-production.up.railway.app/
- Positions: `GET /api/train/position`
- Timetable (on click): `GET /api/trains/:id` where `:id` is the advertised train number
