# tågkarta

Live map of trains in Sweden. Positions are fetched as JSON from the wrapper API — the client does not call Trafikverket directly.

Click a train to open a side panel with operator, route, and timetable (`GET /api/trains/:id` for the selected advertised train number only). Filter the map by train number or operator in the overlay (client-side on polled positions; empty filters show every train). Railway tracks are an OpenRailwayMap tile overlay on OSM (toggle **Spår** in the overlay).

Markers are larger discs with a padded hit target so they are easier to click at Sweden-wide zoom. Heading arrows are derived client-side from successive positions (the bulk DTO has no bearing); optional top-level `speed` is parsed if present, and `speed === 0` hides the arrow. `GET /api/train/position` may include optional `operator`, `fromName`, and `toName` (omitted when unknown). The client parses them as optional — missing fields are fine today, and operator badges / route text light up when the API starts sending them. Selecting a train also copies operator from the details response onto that marker. The app does not fetch details for every train.

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

## Railway

- Build command: `npm run build`
- Start command: `npm start` (`serve -s dist` on `0.0.0.0:$PORT`)

Production browsers call the wrapper API from this origin, so that API must send CORS headers. The Vite `/api` proxy is only used during `npm run dev`.

## API

- Base URL: https://trafikverket-api-production.up.railway.app/
- Positions: `GET /api/train/position`
- Timetable (on click): `GET /api/trains/:id` where `:id` is the advertised train number
