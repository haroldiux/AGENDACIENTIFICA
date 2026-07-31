"use client";
import { FileText, Download } from 'lucide-react';

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Generación de Reportes</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
          <div className="w-10 h-10 rounded bg-primary/20 text-primary flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-medium text-lg">Reporte de Conflictos</h4>
            <p className="text-sm text-slate-400 mt-1">Lista de cruces detectados entre agenda académica y científica.</p>
          </div>
          <button className="mt-auto bg-[#1e293b] hover:bg-[#334155] border border-[var(--border)] px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors w-full">
            <Download className="w-4 h-4" />
            Descargar PDF
          </button>
        </div>

        <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
          <div className="w-10 h-10 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-medium text-lg">Agenda Consolidada</h4>
            <p className="text-sm text-slate-400 mt-1">Exportación completa del calendario fusionado por carrera.</p>
          </div>
          <button className="mt-auto bg-[#1e293b] hover:bg-[#334155] border border-[var(--border)] px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors w-full">
            <Download className="w-4 h-4" />
            Exportar Excel
          </button>
        </div>
      </div>
    </div>
  );
}
