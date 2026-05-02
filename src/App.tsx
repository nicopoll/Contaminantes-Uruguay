import { NavLink, Outlet } from "react-router-dom";

const linkBase =
  "px-3.5 py-2 rounded text-white no-underline transition-colors";
const linkClass = ({ isActive }: { isActive: boolean }) =>
  `${linkBase} ${isActive ? "bg-green-600" : "hover:bg-green-600/80"}`;

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <nav className="flex gap-2 bg-slate-800 px-5 py-3">
        <NavLink to="/" end className={linkClass}>Home</NavLink>
        <NavLink to="/map" className={linkClass}>Mapa</NavLink>
        <NavLink to="/table" className={linkClass}>Tabla</NavLink>
      </nav>
      <main className="p-5">
        <Outlet />
      </main>
    </div>
  );
}
