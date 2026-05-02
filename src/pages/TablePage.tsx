import { useMemo, useState } from "react";
import { useSamples } from "../hooks/useSamples";
import { filterSamples, uniqueValues } from "../lib/filters";
import FilterField, { controlClass } from "../components/FilterField";
import type { Sample } from "../lib/types";

const COLUMNS: (keyof Sample)[] = [
  "Fecha",
  "Contaminante",
  "Tipo",
  "Clase",
  "Muestra",
  "Dirección",
  "Analista",
  "Concentración (ppm)",
  "Latitud",
  "Longitud",
];

export default function TablePage() {
  const { samples, loading, error } = useSamples();
  const [contaminant, setContaminant] = useState("all");
  const [sample, setSample] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const contaminants = useMemo(() => uniqueValues(samples, "Contaminante"), [samples]);
  const sampleIds = useMemo(() => uniqueValues(samples, "Muestra"), [samples]);
  const rows = useMemo(
    () => filterSamples(samples, { contaminant, sample, startDate, endDate }),
    [samples, contaminant, sample, startDate, endDate]
  );

  function reset() {
    setContaminant("all");
    setSample("");
    setStartDate("");
    setEndDate("");
  }

  if (loading) return <p className="text-slate-500">Cargando…</p>;
  if (error) return <p className="text-red-600">Error cargando datos: {error.message}</p>;

  return (
    <section>
      <h1 className="mb-4 text-3xl font-bold tracking-tight">Tabla de Contaminantes</h1>
      <div className="mb-4 flex flex-wrap items-end gap-4 rounded-lg bg-white p-4 shadow-sm">
        <FilterField label="Contaminante:">
          <select className={controlClass} value={contaminant} onChange={(e) => setContaminant(e.target.value)}>
            <option value="all">Todos</option>
            {contaminants.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Muestra:">
          <select className={controlClass} value={sample} onChange={(e) => setSample(e.target.value)}>
            <option value="">Todas</option>
            {sampleIds.map((m) => (
              <option key={m} value={m}>{m}</option>
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
          onClick={reset}
          className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
        >
          Limpiar
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr>
              {COLUMNS.map((c) => (
                <th
                  key={c}
                  className="border border-slate-200 bg-green-600 px-3 py-2.5 text-left font-semibold text-white"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="even:bg-slate-50">
                {COLUMNS.map((c) => (
                  <td key={c} className="border border-slate-200 px-3 py-2.5">
                    {r[c]}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="border border-slate-200 px-3 py-4 text-center text-slate-500"
                >
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
