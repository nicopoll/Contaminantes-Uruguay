export function uniqueValues(samples, key) {
  return Array.from(new Set(samples.map((s) => s[key]))).filter(Boolean).sort();
}

export function filterSamples(samples, { contaminant, sample, startDate, endDate }) {
  return samples.filter((s) => {
    if (contaminant && contaminant !== "all" && s.Contaminante !== contaminant) return false;
    if (sample && s.Muestra !== sample) return false;
    if (startDate && s.Fecha < startDate) return false;
    if (endDate && s.Fecha > endDate) return false;
    return true;
  });
}
