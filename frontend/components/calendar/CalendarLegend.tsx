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

interface CalendarLegendProps {
  className?: string;
}

export default function CalendarLegend({ className = '' }: CalendarLegendProps) {
  return (
    <div className={`bg-card text-card-foreground border border-border shadow-sm p-4 rounded-xl space-y-4 ${className}`}>
      <h4 className="text-sm font-semibold text-foreground">Leyenda</h4>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <BookOpen className="w-4 h-4 text-foreground" />
          <span className="font-semibold text-foreground">Actividades Académicas</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CALENDAR_COLORS.academic).map(([key, color]) => (
            <div
              key={key}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border border-border"
            >
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-muted-foreground font-medium capitalize">
                {key === 'default' ? 'Otra' : key}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-3 space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FlaskConical className="w-4 h-4 text-foreground" />
          <span className="font-semibold text-foreground">Actividades Científicas</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CALENDAR_COLORS.scientific).map(([key, color]) => (
            <div
              key={key}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border border-border"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-muted-foreground font-medium capitalize">
                {key.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-3 space-y-2 text-xs">
        <span className="font-semibold text-foreground block mb-1">Identificadores de Alcance:</span>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-purple-400/50 shrink-0" />
          <span className="font-medium">Global / Vicerrectorado</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 ring-1 ring-white/60 shrink-0" />
          <span className="font-medium">Investigación Científica</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-medium">Académica por Carrera</span>
        </div>
      </div>
    </div>
  );
}
