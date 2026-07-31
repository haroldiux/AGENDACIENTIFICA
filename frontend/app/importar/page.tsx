"use client";
import { UploadCloud } from 'lucide-react';

export default function ImportarPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="glass-panel p-8 rounded-xl text-center">
        <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Importar Calendario Académico</h3>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">Sube un archivo Excel (.xlsx) con el formato establecido para actualizar la agenda académica base.</p>
        
        <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-12 hover:bg-white/5 transition-colors cursor-pointer flex flex-col items-center justify-center gap-4">
          <p className="text-slate-300">Arrastra y suelta tu archivo aquí</p>
          <span className="text-slate-500 text-sm">o</span>
          <button className="bg-[#1e293b] hover:bg-[#334155] border border-[var(--border)] px-6 py-2 rounded-lg text-sm transition-colors">
            Seleccionar Archivo
          </button>
        </div>
      </div>
    </div>
  );
}
