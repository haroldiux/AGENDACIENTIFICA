'use client';

import { BookOpen, FlaskConical } from 'lucide-react';

export const CALENDAR_COLORS = {
  academic: {
    examen: '#ef4444',
    receso: '#6b7280',
    reunion: '#3b82f6',
    curso: '#10b981',
    'clase magistral': '#8b5cf6',
    taller: '#f59e0b',
    seminario: '#06b6d4',
    conferencia: '#ec4899',
    'práctica de campo': '#14b8a6',
    default: '#6366f1',
  },
  scientific: {
    congreso: '#f59e0b',
    webinar: '#06b6d4',
    defensa: '#ec4899',
    feria: '#8b5cf6',
    olimpiada: '#14b8a6',
    master_class: '#f97316',
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
      <h4 className="text-sm font-semibold text-slate-300">Leyenda</h4>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <BookOpen className="w-4 h-4 text-slate-300" />
          <span className="font-medium">Actividades Académicas</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CALENDAR_COLORS.academic).map(([key, color]) => (
            <div
              key={key}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5"
            >
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-slate-400 capitalize">
                {key === 'default' ? 'Otra' : key}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-3 space-y-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <FlaskConical className="w-4 h-4 text-slate-300" />
          <span className="font-medium">Actividades Científicas</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CALENDAR_COLORS.scientific).map(([key, color]) => (
            <div
              key={key}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0 border-2 border-white/20"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-slate-400 capitalize">
                {key.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-3 text-xs text-slate-500">
        <p>
          <span className="inline-block w-3 h-3 rounded-sm bg-slate-500 mr-1 align-middle" />
          Fondo sólido = Académica
        </p>
        <p className="mt-1">
          <span className="inline-block w-3 h-3 rounded-full border-2 border-slate-500 mr-1 align-middle" />
          Borde redondo = Científica
        </p>
      </div>
    </div>
  );
}
