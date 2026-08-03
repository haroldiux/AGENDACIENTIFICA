"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  FileUp,
  LayoutDashboard,
  FlaskConical,
  FileBarChart,
  GraduationCap,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendario", label: "Calendario", icon: Calendar },
  { href: "/actividades", label: "Actividades", icon: FlaskConical },
  { href: "/importar", label: "Importar", icon: FileUp },
  { href: "/reportes", label: "Reportes", icon: FileBarChart },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="sidebar w-full md:w-64 md:min-h-screen p-5 flex flex-col gap-8 sticky top-0 z-20 md:border-r border-b md:border-b-0 border-[var(--border)]">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-3 px-1 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold tracking-tight leading-tight">UNITEPC</p>
          <p className="text-[11px] text-slate-500 leading-tight">
            Agenda Científica
          </p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`nav-link ${active ? "nav-link-active" : ""}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="whitespace-nowrap">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="hidden md:block px-3 py-3 rounded-xl bg-white/[0.03] border border-[var(--border)]">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Depto. de Investigación Científica
          <br />
          <span className="text-slate-600">Calendario académico + científico</span>
        </p>
      </div>
    </aside>
  );
}
