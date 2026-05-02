import { useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { useSamples } from "../hooks/useSamples";
import { filterSamples, uniqueValues } from "../lib/filters";
import FilterField, { controlClass } from "../components/FilterField";

L.Marker.prototype.options.icon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapPage() {
  const { samples, loading, error } = useSamples();
  const [contaminant, setContaminant] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const contaminants = useMemo(() => uniqueValues(samples, "Contaminante"), [samples]);
  const filtered = useMemo(
    () => filterSamples(samples, { contaminant, startDate, endDate }),
    [samples, contaminant, startDate, endDate]
  );

  if (loading) return <p className="text-slate-500">Cargando…</p>;
  if (error) return <p className="text-red-600">Error cargando datos: {error.message}</p>;

  return (
    <section>
      <h1 className="mb-4 text-3xl font-bold tracking-tight">Mapa de Contaminantes</h1>
      <div className="mb-4 flex flex-wrap items-end gap-4 rounded-lg bg-white p-4 shadow-sm">
        <FilterField label="Contaminante:">
          <select className={controlClass} value={contaminant} onChange={(e) => setContaminant(e.target.value)}>
            <option value="all">Todos</option>
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
      </div>
      <MapContainer center={[-32.5, -56.0]} zoom={6} style={{ height: 600 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filtered.map((s, i) => (
          <Marker key={i} position={[s.Latitud, s.Longitud]}>
            <Popup>
              <strong>{s["Contaminante"]}</strong>
              <br />
              {s["Fecha"]} — {s["Muestra"]}
              <br />
              {s["Concentración (ppm)"]} ppm
              <br />
              {s["Dirección"]}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </section>
  );
}
