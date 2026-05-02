import type { Sample } from "./types";

export function uniqueValues<K extends keyof Sample>(
  samples: Sample[],
  key: K
): Array<Sample[K]> {
  return Array.from(new Set(samples.map((s) => s[key])))
    .filter((v): v is Sample[K] => v != null && v !== "")
    .sort();
}

export interface FilterOptions {
  contaminant?: string;
  sample?: string;
  startDate?: string;
  endDate?: string;
}

export function filterSamples(
  samples: Sample[],
  { contaminant, sample, startDate, endDate }: FilterOptions
): Sample[] {
  return samples.filter((s) => {
    if (contaminant && contaminant !== "all" && s.Contaminante !== contaminant) return false;
    if (sample && s.Muestra !== sample) return false;
    if (startDate && s.Fecha < startDate) return false;
    if (endDate && s.Fecha > endDate) return false;
    return true;
  });
}
