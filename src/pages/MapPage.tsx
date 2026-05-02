import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { LatLngBoundsExpression } from "leaflet";

const DEPARTMENTS: { name: string; lat: number; lng: number }[] = [
  { name: "Artigas", lat: -30.7, lng: -56.5 },
  { name: "Salto", lat: -31.4, lng: -57.3 },
  { name: "Paysandú", lat: -32.1, lng: -57.2 },
  { name: "Río Negro", lat: -32.8, lng: -57.4 },
  { name: "Soriano", lat: -33.5, lng: -57.7 },
  { name: "Colonia", lat: -34.1, lng: -57.85 },
  { name: "San José", lat: -34.3, lng: -56.7 },
  { name: "Canelones", lat: -34.55, lng: -56.05 },
  { name: "Montevideo", lat: -34.85, lng: -56.18 },
  { name: "Maldonado", lat: -34.7, lng: -54.9 },
  { name: "Rocha", lat: -33.95, lng: -54.1 },
  { name: "Lavalleja", lat: -34.05, lng: -54.95 },
  { name: "Florida", lat: -33.85, lng: -56.2 },
  { name: "Flores", lat: -33.55, lng: -56.95 },
  { name: "Durazno", lat: -33.05, lng: -56.4 },
  { name: "Treinta y Tres", lat: -33.0, lng: -54.4 },
  { name: "Cerro Largo", lat: -32.4, lng: -54.4 },
  { name: "Tacuarembó", lat: -32.0, lng: -55.7 },
  { name: "Rivera", lat: -31.2, lng: -55.4 },
];

const DEPT_ICON_CACHE = new Map<string, L.DivIcon>();
function deptIcon(name: string): L.DivIcon {
  let icon = DEPT_ICON_CACHE.get(name);
  if (!icon) {
    icon = L.divIcon({
      className: "dept-label",
      html: `<span>${name}</span>`,
      iconSize: [120, 14],
      iconAnchor: [60, 7],
    });
    DEPT_ICON_CACHE.set(name, icon);
  }
  return icon;
}
import { useSamples } from "../hooks/useSamples";
import { filterSamples, uniqueValues } from "../lib/filters";
import FilterField, { controlClass } from "../components/FilterField";

const COLOR_STOPS: { ppm: number; rgb: [number, number, number]; label: string }[] = [
  { ppm: 0.001, rgb: [50, 205, 50], label: "≤ 1 ppb" },
  { ppm: 0.01, rgb: [255, 255, 0], label: "10 ppb" },
  { ppm: 0.1, rgb: [255, 215, 0], label: "0,1 ppm" },
  { ppm: 1, rgb: [255, 0, 0], label: "1 ppm" },
  { ppm: 10, rgb: [139, 0, 0], label: "≥ 10 ppm" },
];

const MIN_PPM = COLOR_STOPS[0].ppm;
const MAX_PPM = COLOR_STOPS[COLOR_STOPS.length - 1].ppm;

function rgbToHex([r, g, b]: [number, number, number]): string {
  return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
}

function colorFor(ppm: number): string {
  if (!Number.isFinite(ppm) || ppm <= MIN_PPM) return rgbToHex(COLOR_STOPS[0].rgb);
  if (ppm >= MAX_PPM) return rgbToHex(COLOR_STOPS[COLOR_STOPS.length - 1].rgb);
  const log = Math.log10(ppm);
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const a = COLOR_STOPS[i];
    const b = COLOR_STOPS[i + 1];
    const lo = Math.log10(a.ppm);
    const hi = Math.log10(b.ppm);
    if (log >= lo && log <= hi) {
      const t = (log - lo) / (hi - lo);
      return rgbToHex([
        Math.round(a.rgb[0] + (b.rgb[0] - a.rgb[0]) * t),
        Math.round(a.rgb[1] + (b.rgb[1] - a.rgb[1]) * t),
        Math.round(a.rgb[2] + (b.rgb[2] - a.rgb[2]) * t),
      ]);
    }
  }
  return rgbToHex(COLOR_STOPS[COLOR_STOPS.length - 1].rgb);
}

const GRADIENT_CSS = `linear-gradient(to top, ${COLOR_STOPS.map(
  (s, i) => `${rgbToHex(s.rgb)} ${(i / (COLOR_STOPS.length - 1)) * 100}%`
).join(", ")})`;

function Legend() {
  const map = useMap();
  useEffect(() => {
    const control = new L.Control({ position: "bottomright" });
    control.onAdd = () => {
      const div = L.DomUtil.create("div");
      div.style.background = "white";
      div.style.padding = "8px 10px";
      div.style.borderRadius = "6px";
      div.style.boxShadow = "0 1px 3px rgba(0,0,0,0.25)";
      div.style.font = "12px system-ui, sans-serif";
      div.style.lineHeight = "1.2";
      const labelsTopDown = [...COLOR_STOPS].reverse();
      div.innerHTML =
        `<div style="font-weight:600;margin-bottom:6px;">Concentración</div>` +
        `<div style="display:flex;gap:8px;align-items:stretch;">` +
        `<div style="width:14px;height:120px;background:${GRADIENT_CSS};` +
        `border:1px solid rgba(0,0,0,0.2);border-radius:3px;"></div>` +
        `<div style="display:flex;flex-direction:column;justify-content:space-between;height:120px;">` +
        labelsTopDown.map((s) => `<span>${s.label}</span>`).join("") +
        `</div></div>`;
      return div;
    };
    control.addTo(map);
    return () => {
      control.remove();
    };
  }, [map]);
  return null;
}

const URUGUAY_BOUNDS: LatLngBoundsExpression = [
  [-35.2, -58.6],
  [-30.0, -53.0],
];

export default function MapPage() {
  const { samples, loading, error } = useSamples();
  const [contaminant, setContaminant] = useState("none");
  const [type, setType] = useState("none");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const contaminants = useMemo(() => uniqueValues(samples, "Contaminante"), [samples]);
  const types = useMemo(() => uniqueValues(samples, "Tipo"), [samples]);
  const filtered = useMemo(() => {
    if (contaminant !== "none") {
      return filterSamples(samples, { contaminant, startDate, endDate });
    }
    if (type !== "none") {
      return filterSamples(samples, { type, startDate, endDate });
    }
    return [];
  }, [samples, contaminant, type, startDate, endDate]);

  if (loading) return <p className="text-slate-500">Cargando…</p>;
  if (error) return <p className="text-red-600">Error cargando datos: {error.message}</p>;

  return (
    <section>
      <h1 className="mb-4 text-3xl font-bold tracking-tight">Mapa de Contaminantes</h1>
      <div className="mb-4 flex flex-wrap items-end gap-4 rounded-lg bg-white p-4 shadow-sm">
        <FilterField label="Tipo:">
          <select
            className={controlClass}
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              if (e.target.value !== "none") setContaminant("none");
            }}
          >
            <option value="none">Ninguno</option>
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Contaminante:">
          <select
            className={controlClass}
            value={contaminant}
            onChange={(e) => {
              setContaminant(e.target.value);
              if (e.target.value !== "none") setType("none");
            }}
          >
            <option value="none">Ninguno</option>
            {contaminants.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Desde:">
          <input type="date" className={controlClass} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </FilterField>
        <FilterField label="Hasta:">
          <input type="date" className={controlClass} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </FilterField>
        <button
          type="button"
          onClick={() => {
            setContaminant("none");
            setType("none");
            setStartDate("");
            setEndDate("");
          }}
          className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
        >
          Limpiar
        </button>
      </div>
      <MapContainer
        center={[-32.5, -56.0]}
        zoom={7}
        minZoom={6}
        maxBounds={URUGUAY_BOUNDS}
        maxBoundsViscosity={1}
        style={{ height: 600 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          className="map-base"
        />
        {DEPARTMENTS.map((d) => (
          <Marker
            key={d.name}
            position={[d.lat, d.lng]}
            icon={deptIcon(d.name)}
            interactive={false}
            keyboard={false}
          />
        ))}
        <Legend />
        {filtered.map((s, i) => {
          const c = colorFor(s["Concentración (ppm)"]);
          return (
          <CircleMarker
            key={i}
            center={[s.Latitud, s.Longitud]}
            radius={12}
            pathOptions={{
              color: c,
              weight: 1,
              fillColor: c,
              fillOpacity: 0.5,
              opacity: 0.5,
            }}
          >
            <Popup>
              <strong>{s["Contaminante"]}</strong>
              <br />
              {s["Fecha"]} — {s["Muestra"]}
              <br />
              {s["Concentración (ppm)"]} ppm
              <br />
              {s["Dirección"]}
            </Popup>
          </CircleMarker>
          );
        })}
      </MapContainer>
    </section>
  );
}
