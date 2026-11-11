'use client';

import { Filter, Calendar, GraduationCap } from 'lucide-react';
import { Career, Gestion } from '@/lib/api';

interface DashboardFiltersProps {
  gestiones: Gestion[];
  careers: Career[];
  selectedGestionId: number | null;
  selectedCareerId: number | null;
  onGestionChange: (id: number | null) => void;
  onCareerChange: (id: number | null) => void;
  disabled?: boolean;
}

/** Converts '1-2026' -> 'Semestre 1 – 2026', leaves unknown formats as-is. */
function formatGestion(name: string): string {
  const match = name.match(/^([12])-(\d{4})$/);
  if (match) return `Semestre ${match[1]} – ${match[2]}`;
  return name;
}

export default function DashboardFilters({
  gestiones,
  careers,
  selectedGestionId,
  selectedCareerId,
  onGestionChange,
  onCareerChange,
  disabled = false,
}: DashboardFiltersProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-[var(--shadow-glass)] p-4 flex flex-col md:flex-row gap-4 md:items-center justify-between dark:bg-slate-900/60 dark:border-white/6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Filter className="w-4 h-4 text-blue-500 dark:text-blue-400" />
        </div>
        <span className="text-sm font-semibold tracking-wide text-foreground">Filtros de Análisis</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-1 md:max-w-xl">
        {/* Gestion Filter */}
        <div className="flex-1 relative flex items-center">
          <Calendar className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
          <select
            value={selectedGestionId ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              onGestionChange(val ? Number(val) : null);
            }}
            disabled={disabled}
            className="w-full bg-background text-foreground border border-input rounded-xl pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-50 appearance-none dark:bg-slate-800/80 dark:border-white/10"
          >
            <option value="">Todas las gestiones</option>
            {gestiones.map((g) => (
              <option key={g.id} value={g.id}>
                {formatGestion(g.name)}
              </option>
            ))}
          </select>
        </div>

        {/* Career Filter */}
        <div className="flex-1 relative flex items-center">
          <GraduationCap className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
          <select
            value={selectedCareerId ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              onCareerChange(val ? Number(val) : null);
            }}
            disabled={disabled}
            className="w-full bg-background text-foreground border border-input rounded-xl pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-50 appearance-none dark:bg-slate-800/80 dark:border-white/10"
          >
            <option value="">Todas las carreras</option>
            {careers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.faculty})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
