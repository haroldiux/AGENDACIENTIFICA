import { Filter } from 'lucide-react';

interface CareerOption {
  id: number;
  name: string;
}

interface GestionOption {
  id: number;
  name: string;
}

/** Converts '1-2026' -> 'Semestre 1 – 2026', leaves unknown formats as-is. */
function formatGestion(name: string): string {
  const match = name.match(/^([12])-(\d{4})$/);
  if (match) return `Semestre ${match[1]} – ${match[2]}`;
  return name;
}

interface SedeOption {
  id: number;
  name: string;
}

interface AgendaFilterBarProps {
  careers: CareerOption[];
  gestiones: GestionOption[];
  sedes?: SedeOption[];
  careerId: number | null;
  gestionId: number | null;
  sedeId?: number | null;
  pilarFilter?: string;
  regimenFilter?: string;
  onCareerChange: (id: number | null) => void;
  onGestionChange: (id: number | null) => void;
  onSedeChange?: (id: number | null) => void;
  onPilarChange?: (pilar: string) => void;
  onRegimenChange?: (regimen: string) => void;
  disabled?: boolean;
}

export default function AgendaFilterBar({
  careers,
  gestiones,
  sedes = [],
  careerId,
  gestionId,
  sedeId,
  pilarFilter,
  regimenFilter,
  onCareerChange,
  onGestionChange,
  onSedeChange,
  onPilarChange,
  onRegimenChange,
  disabled = false,
}: AgendaFilterBarProps) {
  const handleCareerChange = (value: string) => {
    const id = value ? Number(value) : null;
    onCareerChange(Number.isNaN(id) ? null : id);
  };

  const handleGestionChange = (value: string) => {
    const id = value ? Number(value) : null;
    onGestionChange(Number.isNaN(id) ? null : id);
  };

  const handleSedeChange = (value: string) => {
    if (!onSedeChange) return;
    const id = value ? Number(value) : null;
    onSedeChange(Number.isNaN(id) ? null : id);
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 flex flex-col gap-4 dark:bg-slate-900/60 dark:border-white/6">
      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        {sedes.length > 0 && onSedeChange && (
          <div className="flex flex-col gap-1.5 min-w-[180px] flex-1">
            <label htmlFor="sede-select" className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5 block">
              Sede
            </label>
            <select
              id="sede-select"
              value={sedeId === null || sedeId === undefined ? 'all' : sedeId}
              onChange={(e) => handleSedeChange(e.target.value === 'all' ? '' : e.target.value)}
              disabled={disabled}
              className="w-full bg-background border border-input text-foreground rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 transition-colors dark:bg-slate-800/80 dark:border-white/10"
            >
              <option value="all">Todas las Sedes / Nacional</option>
              {sedes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1.5 min-w-[200px] flex-1">
          <label htmlFor="career-select" className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5 block">
            Carrera
          </label>
          <select
            id="career-select"
            value={careerId === null ? 'all' : careerId}
            onChange={(e) => {
              const val = e.target.value;
              onCareerChange(val === 'all' ? null : Number(val));
            }}
            disabled={disabled}
            className="w-full bg-background border border-input text-foreground rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 transition-colors dark:bg-slate-800/80 dark:border-white/10"
          >
            <option value="all">Todas las carreras / General</option>
            {careers.map((career) => (
              <option key={career.id} value={career.id}>
                {career.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 min-w-[160px] flex-1">
          <label htmlFor="gestion-select" className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5 block">
            Gestión
          </label>
          <select
            id="gestion-select"
            value={gestionId ?? ''}
            onChange={(e) => handleGestionChange(e.target.value)}
            disabled={disabled}
            className="w-full bg-background border border-input text-foreground rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 transition-colors dark:bg-slate-800/80 dark:border-white/10"
          >
            <option value="">Todas las gestiones</option>
            {gestiones.map((gestion) => (
              <option key={gestion.id} value={gestion.id}>
                {formatGestion(gestion.name)}
              </option>
            ))}
          </select>
        </div>

        {onPilarChange && (
          <div className="flex flex-col gap-1.5 min-w-[170px] flex-1">
            <label htmlFor="pilar-select" className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5 block">
              Pilar
            </label>
            <select
              id="pilar-select"
              value={pilarFilter ?? 'all'}
              onChange={(e) => onPilarChange(e.target.value)}
              disabled={disabled}
              className="w-full bg-background border border-input text-foreground rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 transition-colors dark:bg-slate-800/80 dark:border-white/10"
            >
              <option value="all">Todos los Pilares</option>
              <option value="investigacion">Investigación</option>
              <option value="academica">Académico</option>
              <option value="interaccion_social">Interacción Social</option>
              <option value="internacionalizacion">Internacionalización</option>
            </select>
          </div>
        )}

        {onRegimenChange && (
          <div className="flex flex-col gap-1.5 min-w-[140px] flex-1">
            <label htmlFor="regimen-select" className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5 block">
              Régimen
            </label>
            <select
              id="regimen-select"
              value={regimenFilter ?? 'all'}
              onChange={(e) => onRegimenChange(e.target.value)}
              disabled={disabled}
              className="w-full bg-background border border-input text-foreground rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 transition-colors dark:bg-slate-800/80 dark:border-white/10"
            >
              <option value="all">Todos</option>
              <option value="semestral">Semestral</option>
              <option value="anual">Anual</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
