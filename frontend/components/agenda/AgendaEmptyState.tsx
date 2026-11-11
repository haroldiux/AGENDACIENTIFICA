import { Inbox } from 'lucide-react';

export default function AgendaEmptyState() {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-[var(--shadow-glass)] p-8 flex flex-col items-center text-center gap-4 min-h-[400px] justify-center dark:border-white/10 dark:bg-slate-900/60 dark:backdrop-blur-sm">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <Inbox className="w-8 h-8 text-muted-foreground" />
      </div>
      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-semibold text-foreground">No hay actividades</h3>
        <p className="text-muted-foreground leading-relaxed">
          No se encontraron actividades científicas para los filtros seleccionados.
          Pruebe con otra carrera, gestión o verifique que existan actividades registradas.
        </p>
      </div>
    </div>
  );
}
