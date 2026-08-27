# tågkarta

Live karta över tåg i Sverige. Positionerna hämtas som JSON från wrapper-API:t — klienten anropar inte Trafikverket direkt.

## Kom igång

```bash
npm install
npm run dev
```

Öppna adressen som Vite skriver ut (oftast http://localhost:5173). I utveckling proxas `/api` till API:t så att CORS inte behövs lokalt.

## Bygga

```bash
npm run build
```

Produktionsbygget anropar API:t direkt på Railway.

## API

- Bas-URL: https://trafikverket-api-production.up.railway.app/
- Positioner: `GET /api/train/position`
