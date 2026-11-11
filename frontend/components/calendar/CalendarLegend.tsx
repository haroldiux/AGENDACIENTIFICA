'use client';

import { BookOpen, FlaskConical } from 'lucide-react';
import { useTheme } from 'next-themes';

export interface EventThemePalette {
  accent: string;
  lightBg: string;
  lightText: string;
  lightBorder: string;
  darkBg: string;
  darkText: string;
  darkBorder: string;
}

export const CALENDAR_PALETTES: {
  academic: Record<string, EventThemePalette>;
  scientific: Record<string, EventThemePalette>;
} = {
  academic: {
    examen: {
      accent: '#E11D48',
      lightBg: '#FFE4E6',
      lightText: '#881337',
      lightBorder: '#FECDD3',
      darkBg: 'rgba(225, 29, 72, 0.22)',
      darkText: '#FDA4AF',
      darkBorder: 'rgba(244, 63, 94, 0.38)',
    },
    inicio_fin: {
      accent: '#4F46E5',
      lightBg: '#E0E7FF',
      lightText: '#312E81',
      lightBorder: '#C7D2FE',
      darkBg: 'rgba(79, 70, 229, 0.24)',
      darkText: '#A5B4FC',
      darkBorder: 'rgba(99, 102, 241, 0.40)',
    },
    feriado: {
      accent: '#0D9488',
      lightBg: '#CCFBF1',
      lightText: '#134E4A',
      lightBorder: '#99F6E4',
      darkBg: 'rgba(13, 148, 136, 0.22)',
      darkText: '#5EEAD4',
      darkBorder: 'rgba(20, 184, 166, 0.38)',
    },
    administrativo: {
      accent: '#0284C7',
      lightBg: '#E0F2FE',
      lightText: '#0C4A6E',
      lightBorder: '#BAE6FD',
      darkBg: 'rgba(2, 132, 199, 0.22)',
      darkText: '#7DD3FC',
      darkBorder: 'rgba(14, 165, 233, 0.38)',
    },
    receso: {
      accent: '#64748B',
      lightBg: '#F1F5F9',
      lightText: '#334155',
      lightBorder: '#CBD5E1',
      darkBg: 'rgba(100, 116, 139, 0.25)',
      darkText: '#CBD5E1',
      darkBorder: 'rgba(148, 163, 184, 0.38)',
    },
    reunion: {
      accent: '#2563EB',
      lightBg: '#DBEAFE',
      lightText: '#1E3A8A',
      lightBorder: '#BFDBFE',
      darkBg: 'rgba(37, 99, 235, 0.22)',
      darkText: '#93C5FD',
      darkBorder: 'rgba(59, 130, 246, 0.38)',
    },
    curso: {
      accent: '#059669',
      lightBg: '#D1FAE5',
      lightText: '#064E3B',
      lightBorder: '#A7F3D0',
      darkBg: 'rgba(5, 150, 105, 0.22)',
      darkText: '#6EE7B7',
      darkBorder: 'rgba(16, 185, 129, 0.38)',
    },
    'clase magistral': {
      accent: '#7C3AED',
      lightBg: '#EDE9FE',
      lightText: '#4C1D95',
      lightBorder: '#DDD6FE',
      darkBg: 'rgba(124, 58, 237, 0.24)',
      darkText: '#C4B5FD',
      darkBorder: 'rgba(139, 92, 246, 0.40)',
    },
    taller: {
      accent: '#D97706',
      lightBg: '#FEF3C7',
      lightText: '#78350F',
      lightBorder: '#FDE68A',
      darkBg: 'rgba(217, 119, 6, 0.22)',
      darkText: '#FCD34D',
      darkBorder: 'rgba(245, 158, 11, 0.38)',
    },
    seminario: {
      accent: '#0284C7',
      lightBg: '#E0F2FE',
      lightText: '#0C4A6E',
      lightBorder: '#BAE6FD',
      darkBg: 'rgba(2, 132, 199, 0.22)',
      darkText: '#7DD3FC',
      darkBorder: 'rgba(14, 165, 233, 0.38)',
    },
    conferencia: {
      accent: '#C026D3',
      lightBg: '#FAE8FF',
      lightText: '#701A75',
      lightBorder: '#F5D0FE',
      darkBg: 'rgba(192, 38, 211, 0.22)',
      darkText: '#F0ABFC',
      darkBorder: 'rgba(217, 70, 239, 0.38)',
    },
    'práctica de campo': {
      accent: '#0D9488',
      lightBg: '#CCFBF1',
      lightText: '#134E4A',
      lightBorder: '#99F6E4',
      darkBg: 'rgba(13, 148, 136, 0.22)',
      darkText: '#5EEAD4',
      darkBorder: 'rgba(20, 184, 166, 0.38)',
    },
    default: {
      accent: '#4F46E5',
      lightBg: '#E0E7FF',
      lightText: '#312E81',
      lightBorder: '#C7D2FE',
      darkBg: 'rgba(79, 70, 229, 0.24)',
      darkText: '#A5B4FC',
      darkBorder: 'rgba(99, 102, 241, 0.40)',
    },
  },
  scientific: {
    congreso: {
      accent: '#6366F1',
      lightBg: '#E0E7FF',
      lightText: '#312E81',
      lightBorder: '#C7D2FE',
      darkBg: 'rgba(99, 102, 241, 0.24)',
      darkText: '#A5B4FC',
      darkBorder: 'rgba(129, 140, 248, 0.40)',
    },
    webinar: {
      accent: '#0891B2',
      lightBg: '#CFFAFE',
      lightText: '#164E63',
      lightBorder: '#A5F3FC',
      darkBg: 'rgba(8, 145, 178, 0.22)',
      darkText: '#67E8F9',
      darkBorder: 'rgba(6, 182, 212, 0.38)',
    },
    defensa: {
      accent: '#DB2777',
      lightBg: '#FCE7F3',
      lightText: '#831843',
      lightBorder: '#FBCFE8',
      darkBg: 'rgba(219, 39, 119, 0.22)',
      darkText: '#F9A8D4',
      darkBorder: 'rgba(236, 72, 153, 0.38)',
    },
    feria: {
      accent: '#16A34A',
      lightBg: '#DCFCE7',
      lightText: '#14532D',
      lightBorder: '#BBF7D0',
      darkBg: 'rgba(22, 163, 74, 0.22)',
      darkText: '#86EFAC',
      darkBorder: 'rgba(34, 197, 94, 0.38)',
    },
    olimpiada: {
      accent: '#CA8A04',
      lightBg: '#FEF9C3',
      lightText: '#713F12',
      lightBorder: '#FEF08A',
      darkBg: 'rgba(202, 138, 4, 0.22)',
      darkText: '#FDE047',
      darkBorder: 'rgba(234, 179, 8, 0.38)',
    },
    master_class: {
      accent: '#EA580C',
      lightBg: '#FFEDD5',
      lightText: '#7C2D12',
      lightBorder: '#FED7AA',
      darkBg: 'rgba(234, 88, 12, 0.22)',
      darkText: '#FDBA74',
      darkBorder: 'rgba(249, 115, 22, 0.38)',
    },
  },
};

export const CALENDAR_COLORS = {
  academic: Object.fromEntries(
    Object.entries(CALENDAR_PALETTES.academic).map(([k, v]) => [k, v.accent])
  ) as Record<string, string>,
  scientific: Object.fromEntries(
    Object.entries(CALENDAR_PALETTES.scientific).map(([k, v]) => [k, v.accent])
  ) as Record<string, string>,
} as const;

const ACADEMIC_LABELS: Record<string, string> = {
  examen: 'Examen',
  inicio_fin: 'Inicio / Fin',
  feriado: 'Feriado',
  administrativo: 'Administrativo',
  receso: 'Receso',
  reunion: 'Reunión',
  curso: 'Curso',
  'clase magistral': 'Clase Magistral',
  taller: 'Taller',
  seminario: 'Seminario',
  conferencia: 'Conferencia',
  'práctica de campo': 'Práctica de Campo',
  default: 'Otra',
};

export function getAcademicPalette(category?: string | null): EventThemePalette {
  if (!category) return CALENDAR_PALETTES.academic.default;
  const key = category.toLowerCase().trim();
  return CALENDAR_PALETTES.academic[key] ?? CALENDAR_PALETTES.academic.default;
}

export function getScientificPalette(type?: string | null): EventThemePalette {
  if (!type) return CALENDAR_PALETTES.scientific.congreso;
  const key = type.toLowerCase().trim();
  return CALENDAR_PALETTES.scientific[key] ?? CALENDAR_PALETTES.scientific.congreso;
}

export function getEventPalette(item: {
  source_type: string;
  category?: string | null;
  activity_type?: string | null;
  origin_color?: string | null;
}): EventThemePalette {
  if (item.source_type === 'academic') {
    return getAcademicPalette(item.category);
  }
  return getScientificPalette(item.activity_type);
}

export function getAcademicColor(category?: string | null): string {
  return getAcademicPalette(category).accent;
}

export function getScientificColor(type?: string | null): string {
  return getScientificPalette(type).accent;
}

export function getEventColor(item: {
  source_type: string;
  category?: string | null;
  activity_type?: string | null;
  origin_color?: string | null;
}): string {
  return getEventPalette(item).accent;
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const handleChipClick = (group: 'academic' | 'scientific' | 'scope', key: string) => {
    if (!onFilterChange) return;
    if (activeFilter?.group === group && activeFilter?.key === key) {
      onFilterChange(null);
    } else {
      onFilterChange({ group, key });
    }
  };

  return (
    <div className={`bg-surface text-foreground border border-border shadow-sm p-4 rounded-xl space-y-4 ${className}`}>
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

      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">Actividades Académicas</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(CALENDAR_PALETTES.academic).map(([key, palette]) => {
            const isSelected = activeFilter?.group === 'academic' && activeFilter?.key === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleChipClick('academic', key)}
                style={{
                  backgroundColor: isDark ? palette.darkBg : palette.lightBg,
                  color: isDark ? palette.darkText : palette.lightText,
                  borderColor: isSelected ? palette.accent : isDark ? palette.darkBorder : palette.lightBorder,
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all border ${
                  isSelected
                    ? 'ring-2 ring-primary/40 font-bold shadow-sm scale-[1.02]'
                    : 'font-medium hover:opacity-90'
                }`}
                title={`Filtrar por ${ACADEMIC_LABELS[key] ?? key}`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: palette.accent }}
                />
                <span>{ACADEMIC_LABELS[key] ?? key}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border pt-3 space-y-2.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FlaskConical className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">Actividades Científicas</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(CALENDAR_PALETTES.scientific).map(([key, palette]) => {
            const isSelected = activeFilter?.group === 'scientific' && activeFilter?.key === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleChipClick('scientific', key)}
                style={{
                  backgroundColor: isDark ? palette.darkBg : palette.lightBg,
                  color: isDark ? palette.darkText : palette.lightText,
                  borderColor: isSelected ? palette.accent : isDark ? palette.darkBorder : palette.lightBorder,
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all border ${
                  isSelected
                    ? 'ring-2 ring-primary/40 font-bold shadow-sm scale-[1.02]'
                    : 'font-medium hover:opacity-90'
                }`}
                title={`Filtrar por ${key.replace('_', ' ')}`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: palette.accent }}
                />
                <span className="capitalize">{key.replace('_', ' ')}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border pt-3 space-y-2 text-xs">
        <span className="font-semibold text-foreground block mb-1">Identificadores de Alcance:</span>
        {[
          { key: 'global', label: 'Global / Vicerrectorado', colorBg: 'bg-purple-500 ring-2 ring-purple-400/40' },
          { key: 'scientific', label: 'Investigación Científica', colorBg: 'bg-pink-500 ring-2 ring-pink-400/40' },
          { key: 'career', label: 'Académica por Carrera', colorBg: 'bg-emerald-500 ring-2 ring-emerald-400/40' },
        ].map(({ key, label, colorBg }) => {
          const isSelected = activeFilter?.group === 'scope' && activeFilter?.key === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleChipClick('scope', key)}
              className={`flex items-center gap-2.5 w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all border ${
                isSelected
                  ? 'bg-primary/15 border-primary text-primary font-semibold shadow-sm'
                  : 'bg-muted/40 hover:bg-muted border-border/60 text-foreground/80 hover:text-foreground'
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
