import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchTrainPositions, POLL_MS, type ParsedTrain } from "./api";
import "./style.css";

const SWEDEN_CENTER: L.LatLngExpression = [62.0, 15.5];
const SWEDEN_ZOOM = 5;

const map = L.map("map", {
  center: SWEDEN_CENTER,
  zoom: SWEDEN_ZOOM,
  zoomControl: false,
});

L.control.zoom({ position: "topright" }).addTo(map);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const markers = new Map<string, L.CircleMarker>();
const countEl = requireEl("train-count");
const updatedEl = requireEl("updated");
const statusEl = requireEl("status");

function requireEl(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Saknar element #${id}`);
  return el;
}

function formatStockholm(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
}

function formatModified(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso || "okänd";
  return formatStockholm(date);
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function popupHtml(train: ParsedTrain): string {
  const advertised = escapeHtml(train.advertisedTrainNumber);
  const operational = escapeHtml(train.operationalTrainNumber);
  const statusLabel = train.active ? "Aktivt" : "Inaktivt";
  const updated = escapeHtml(formatModified(train.modifiedTime));
  const extra =
    train.operationalTrainNumber !== train.advertisedTrainNumber
      ? `<p class="popup-meta">Operativt nummer: ${operational}</p>`
      : "";

  return `<div class="popup">
    <p class="popup-title">Tåg ${advertised}</p>
    ${extra}
    <p class="popup-meta">${statusLabel}</p>
    <p class="popup-meta">Uppdaterad: ${updated}</p>
  </div>`;
}

function markerStyle(active: boolean): L.CircleMarkerOptions {
  return {
    radius: 6,
    weight: 1.5,
    color: "#ffffff",
    fillColor: active ? "#0b6bcb" : "#6b7280",
    fillOpacity: 0.95,
  };
}

function upsertMarker(train: ParsedTrain): void {
  const latlng: L.LatLngExpression = [train.lat, train.lon];
  const existing = markers.get(train.id);
  if (existing) {
    existing.setLatLng(latlng);
    existing.setStyle(markerStyle(train.active));
    existing.setPopupContent(popupHtml(train));
    existing.setTooltipContent(train.advertisedTrainNumber);
    return;
  }

  const marker = L.circleMarker(latlng, markerStyle(train.active)).addTo(map);
  marker.bindTooltip(train.advertisedTrainNumber, {
    direction: "top",
    offset: [0, -8],
    opacity: 0.95,
  });
  marker.bindPopup(popupHtml(train));
  markers.set(train.id, marker);
}

function syncMarkers(trains: ParsedTrain[]): void {
  const seen = new Set<string>();
  for (const train of trains) {
    seen.add(train.id);
    upsertMarker(train);
  }

  for (const [id, marker] of markers) {
    if (!seen.has(id)) {
      marker.remove();
      markers.delete(id);
    }
  }
}

function setStatus(message: string | null): void {
  if (!message) {
    statusEl.hidden = true;
    statusEl.textContent = "";
    return;
  }

  statusEl.hidden = false;
  statusEl.textContent = message;
}

function showSuccess(count: number, at: Date): void {
  countEl.textContent = `${count} tåg`;
  updatedEl.textContent = `Uppdaterad ${formatStockholm(at)}`;
  setStatus(null);
}

function showError(message: string): void {
  setStatus(message);
  if (!updatedEl.textContent) {
    countEl.textContent = "Inga tåg att visa";
  }
}

let inFlight = false;

async function poll(): Promise<void> {
  if (inFlight) return;
  inFlight = true;
  try {
    const trains = await fetchTrainPositions();
    syncMarkers(trains);
    showSuccess(trains.length, new Date());
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Kunde inte hämta tågpositioner.";
    showError(message);
  } finally {
    inFlight = false;
  }
}

void poll();
window.setInterval(() => {
  void poll();
}, POLL_MS);
