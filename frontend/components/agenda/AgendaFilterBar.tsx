import { Filter } from 'lucide-react';

interface CareerOption {
  id: number;
  name: string;
}

interface GestionOption {
  id: number;
  name: string;
}

interface AgendaFilterBarProps {
  careers: CareerOption[];
  gestiones: GestionOption[];
  careerId: number | null;
  gestionId: number | null;
  onCareerChange: (id: number | null) => void;
  onGestionChange: (id: number | null) => void;
  disabled?: boolean;
}

export default function AgendaFilterBar({
  careers,
  gestiones,
  careerId,
  gestionId,
  onCareerChange,
  onGestionChange,
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

  return (
    <div className="bg-card text-card-foreground border border-border shadow-sm p-4 rounded-xl flex flex-col md:flex-row gap-4 md:items-center">
      <div className="flex items-center gap-2 text-slate-400">
        <Filter className="w-5 h-5" />
        <span className="text-sm font-medium">Filtros</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <div className="flex flex-col gap-1.5 flex-1">
          <label htmlFor="career-select" className="text-xs text-slate-400">
            Carrera
          </label>
          <select
            id="career-select"
            value={careerId ?? ''}
            onChange={(e) => handleCareerChange(e.target.value)}
            disabled={disabled}
            className="w-full bg-background text-foreground border border-input rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            <option value="">Seleccione una carrera</option>
            {careers.map((career) => (
              <option key={career.id} value={career.id}>
                {career.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <label htmlFor="gestion-select" className="text-xs text-slate-400">
            Gestión
          </label>
          <select
            id="gestion-select"
            value={gestionId ?? ''}
            onChange={(e) => handleGestionChange(e.target.value)}
            disabled={disabled}
            className="w-full bg-background text-foreground border border-input rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            <option value="">Todas las gestiones</option>
            {gestiones.map((gestion) => (
              <option key={gestion.id} value={gestion.id}>
                {gestion.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
