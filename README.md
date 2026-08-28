# tågkarta

Live map of trains in Sweden. Positions are fetched as JSON from the wrapper API — the client does not call Trafikverket directly.

Click a train to open a side panel with operator, route, and timetable (`GET /api/trains/:id` for the selected advertised train number only).

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

The production build calls the wrapper API on Railway directly (no Vite proxy).

## Railway

Static frontend via Nixpacks — no Dockerfile.

- Build command: `npm run build`
- Start command: `npm start`

`npm start` serves `dist` with `serve` on `0.0.0.0` and `process.env.PORT` (Railway injects `PORT`). SPA fallback rewrites unknown paths to `index.html`.

Production browsers call the wrapper API from this Railway origin, so that API must send CORS headers (`Access-Control-Allow-Origin` for this origin, or `*`). The Vite `/api` proxy is only used during local `npm run dev`.

## API

- Base URL: https://trafikverket-api-production.up.railway.app/
- Positions: `GET /api/train/position`
- Timetable (on click): `GET /api/trains/:id` where `:id` is the advertised train number
