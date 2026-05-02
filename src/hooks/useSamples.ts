import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import type { Sample } from "../lib/types";

interface UseSamplesResult {
  samples: Sample[];
  error: Error | null;
  loading: boolean;
}

const SOURCES = [
  { path: "/data/sample-data.xlsx", type: "xlsx" as const },
  { path: "/data/sample-data.csv", type: "csv" as const },
];

async function loadRows(): Promise<Record<string, unknown>[]> {
  for (const src of SOURCES) {
    const res = await fetch(src.path);
    if (!res.ok) continue;
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("text/html")) continue;
    if (src.type === "xlsx") {
      const buf = await res.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
        raw: true,
      });
    }
    return parseCsv(await res.text());
  }
  throw new Error(
    "No se encontró sample-data.xlsx ni sample-data.csv en /public/data/"
  );
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text
    .split(/\r?\n/)
    .filter((l) => l.replace(/[;\s]/g, "").length > 0);
  if (lines.length === 0) return [];
  const headers = lines[0]
    .split(";")
    .map((h) => h.trim())
    .filter(Boolean);
  return lines.slice(1).map((line) => {
    const cells = line.split(";");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (cells[i] ?? "").trim();
    });
    return row;
  });
}

function toIsoDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "number") {
    const d = XLSX.SSF.parse_date_code(value);
    if (d) {
      const mm = String(d.m).padStart(2, "0");
      const dd = String(d.d).padStart(2, "0");
      return `${d.y}-${mm}-${dd}`;
    }
  }
  const s = String(value ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (m) {
    const [, d, mo, y] = m;
    const yyyy = y.length === 2 ? `20${y}` : y;
    return `${yyyy}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return s;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (value == null) return NaN;
  return Number(String(value).replace(",", "."));
}

function toCoord(value: unknown, max: number): number {
  const n = toNumber(value);
  if (!Number.isFinite(n)) return NaN;
  return Math.abs(n) > max ? n / 1e6 : n;
}

function normalize(rows: Record<string, unknown>[]): Sample[] {
  return rows
    .filter((r) => Object.values(r).some((v) => v !== "" && v != null))
    .map((r) => ({
      Fecha: toIsoDate(r["Fecha"]),
      Contaminante: String(r["Contaminante"] ?? "").trim(),
      Tipo: String(r["Tipo"] ?? "").trim(),
      Clase: String(r["Clase"] ?? "").trim(),
      Muestra: String(r["Muestra"] ?? "").trim(),
      "Dirección": String(r["Dirección"] ?? "").trim(),
      Analista: String(r["Analista"] ?? "").trim(),
      "Concentración (ppm)": toNumber(r["Concentración (ppm)"]),
      Latitud: toCoord(r["Latitud"], 90),
      Longitud: toCoord(r["Longitud"], 180),
    }));
}

export function useSamples(): UseSamplesResult {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadRows()
      .then((rows) => {
        if (!cancelled) setSamples(normalize(rows));
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { samples, error, loading };
}
