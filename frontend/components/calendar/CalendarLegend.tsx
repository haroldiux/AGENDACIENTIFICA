'use client';

import { BookOpen, FlaskConical } from 'lucide-react';

export const CALENDAR_COLORS = {
  academic: {
    examen: '#e11d48',
    receso: '#64748b',
    reunion: '#2563eb',
    curso: '#059669',
    'clase magistral': '#7c3aed',
    taller: '#d97706',
    seminario: '#0284c7',
    conferencia: '#c026d3',
    'práctica de campo': '#0d9488',
    default: '#4f46e5',
  },
  scientific: {
    congreso: '#4f46e5',
    webinar: '#0891b2',
    defensa: '#db2777',
    feria: '#059669',
    olimpiada: '#0284c7',
    master_class: '#ea580c',
  },
} as const;

export function getAcademicColor(category?: string | null): string {
  if (!category) return CALENDAR_COLORS.academic.default;
  const key = category.toLowerCase();
  return (
    (CALENDAR_COLORS.academic as Record<string, string>)[key] ??
    CALENDAR_COLORS.academic.default
  );
}

export function getScientificColor(type?: string | null): string {
  if (!type) return CALENDAR_COLORS.scientific.congreso;
  const key = type.toLowerCase();
  return (
    (CALENDAR_COLORS.scientific as Record<string, string>)[key] ??
    CALENDAR_COLORS.scientific.congreso
  );
}

export function getEventColor(item: {
  source_type: string;
  category?: string | null;
  activity_type?: string | null;
  origin_color?: string | null;
}): string {
  if (item.source_type === 'academic') {
    return item.origin_color ?? getAcademicColor(item.category);
  }
  return getScientificColor(item.activity_type);
}

export interface ActiveLegendFilter {
  group: 'academic' | 'scientific' | 'scope';
  key: string;
}

interface CalendarLegendProps {
  className?: string;
  activeFilter?: ActiveLegendFilter | null;
  onFilterChange?: (filter: ActiveLegendFilter | null) => void;
}

export default function CalendarLegend({
  className = '',
  activeFilter = null,
  onFilterChange,
}: CalendarLegendProps) {
  const handleChipClick = (group: 'academic' | 'scientific' | 'scope', key: string) => {
    if (!onFilterChange) return;
    if (activeFilter?.group === group && activeFilter?.key === key) {
      onFilterChange(null);
    } else {
      onFilterChange({ group, key });
    }
  };

  return (
    <div className={`bg-card text-card-foreground border border-border shadow-sm p-4 rounded-xl space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Leyenda y Filtros</h4>
        {activeFilter && onFilterChange && (
          <button
            onClick={() => onFilterChange(null)}
            className="text-[11px] text-primary hover:underline font-medium"
          >
            Limpiar filtro
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <BookOpen className="w-4 h-4 text-foreground" />
          <span className="font-semibold text-foreground">Actividades Académicas</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(CALENDAR_COLORS.academic).map(([key, color]) => {
            const isSelected = activeFilter?.group === 'academic' && activeFilter?.key === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleChipClick('academic', key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                  isSelected
                    ? 'bg-primary/20 border-primary text-primary shadow-sm font-semibold'
                    : 'bg-muted/40 hover:bg-muted border-border text-muted-foreground hover:text-foreground'
                }`}
                title={`Filtrar por ${key}`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0 shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="capitalize">
                  {key === 'default' ? 'Otra' : key}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border pt-3 space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FlaskConical className="w-4 h-4 text-foreground" />
          <span className="font-semibold text-foreground">Actividades Científicas</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(CALENDAR_COLORS.scientific).map(([key, color]) => {
            const isSelected = activeFilter?.group === 'scientific' && activeFilter?.key === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleChipClick('scientific', key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                  isSelected
                    ? 'bg-primary/20 border-primary text-primary shadow-sm font-semibold'
                    : 'bg-muted/40 hover:bg-muted border-border text-muted-foreground hover:text-foreground'
                }`}
                title={`Filtrar por ${key}`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/20 shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="capitalize">
                  {key.replace('_', ' ')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border pt-3 space-y-2 text-xs">
        <span className="font-semibold text-foreground block mb-1">Identificadores de Alcance:</span>
        {[
          { key: 'global', label: 'Global / Vicerrectorado', colorBg: 'bg-purple-500 ring-2 ring-purple-400/50' },
          { key: 'scientific', label: 'Investigación Científica', colorBg: 'bg-pink-500 ring-1 ring-white/60' },
          { key: 'career', label: 'Académica por Carrera', colorBg: 'bg-emerald-500' },
        ].map(({ key, label, colorBg }) => {
          const isSelected = activeFilter?.group === 'scope' && activeFilter?.key === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleChipClick('scope', key)}
              className={`flex items-center gap-2 w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all border ${
                isSelected
                  ? 'bg-primary/20 border-primary text-primary font-semibold shadow-sm'
                  : 'bg-muted/20 hover:bg-muted/50 border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colorBg}`} />
              <span className="font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
