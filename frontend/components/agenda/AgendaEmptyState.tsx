import { Inbox } from 'lucide-react';

export default function AgendaEmptyState() {
  return (
    <div className="bg-card text-card-foreground border border-border shadow-sm p-8 rounded-xl flex flex-col items-center text-center gap-4 min-h-[400px] justify-center">
      <div className="w-16 h-16 rounded-full bg-slate-700/30 flex items-center justify-center">
        <Inbox className="w-8 h-8 text-slate-400" />
      </div>
      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-semibold text-white">No hay actividades</h3>
        <p className="text-slate-400 leading-relaxed">
          No se encontraron actividades científicas para los filtros seleccionados.
          Pruebe con otra carrera, gestión o verifique que existan actividades registradas.
        </p>
      </div>
    </div>
  );
}
