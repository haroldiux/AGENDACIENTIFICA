import { GraduationCap } from 'lucide-react';

export default function AgendaNoCareerSelected() {
  return (
    <div className="bg-card text-card-foreground border border-border shadow-sm p-8 rounded-xl flex flex-col items-center text-center gap-4 min-h-[400px] justify-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <GraduationCap className="w-8 h-8 text-primary" />
      </div>
      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-semibold text-white">Seleccione una carrera</h3>
        <p className="text-slate-400 leading-relaxed">
          Elija una carrera en el filtro superior para ver su agenda científica
          organizada por mes. También puede elegir una gestión para acotar los resultados.
        </p>
      </div>
    </div>
  );
}
