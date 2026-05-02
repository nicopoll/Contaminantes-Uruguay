export default function FilterField({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold">
      {label}
      {children}
    </label>
  );
}

export const controlClass =
  "rounded border border-slate-300 bg-white px-2.5 py-2 text-sm font-normal focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600";
