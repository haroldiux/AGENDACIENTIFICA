"use client";

import { useEffect, useRef, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import {
  api,
  type Career,
  type Gestion,
} from '@/lib/api';

export default function ReportesPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [careerId, setCareerId] = useState<number | null>(null);
  const [gestionId, setGestionId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadSelectors = async () => {
      try {
        const [careersData, gestionesData] = await Promise.all([
          api.careers.list(),
          api.gestiones.list(),
        ]);
        if (!cancelled) {
          setCareers(careersData);
          setGestiones(gestionesData);
        }
      } catch (err) {
        console.error('Error loading selector options:', err);
        toast.error('Error cargando carreras y gestiones');
      }
    };
    loadSelectors();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleExportResearchAgenda = async () => {
    if (careerId === null || gestionId === null) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setExporting(true);

    try {
      const { task_id } = await api.reports.generate({
        career_id: careerId,
        gestion_id: gestionId,
        format: 'pdf',
        report_type: 'research-agenda',
      });

      intervalRef.current = setInterval(async () => {
        try {
          const status = await api.reports.status(task_id);

          if (status.status === 'completed') {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            const blob = await api.reports.download(task_id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = status.file_name || `agenda-${task_id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            setExporting(false);
            toast.success('Agenda científica exportada correctamente');
          } else if (status.status === 'failed') {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            throw new Error(status.error || 'Error generando el PDF');
          }
        } catch (err) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          setExporting(false);
          toast.error(
            err instanceof Error ? err.message : 'Error exportando el PDF'
          );
        }
      }, 2000);
    } catch (err) {
      setExporting(false);
      toast.error('Error iniciando la exportación del PDF');
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

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

        <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
          <div className="w-10 h-10 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-medium text-lg">Agenda Científica</h4>
            <p className="text-sm text-slate-400 mt-1">Exporta la agenda científica mensual de una carrera y gestión.</p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="report-career" className="text-xs text-slate-400">
                Carrera
              </label>
              <select
                id="report-career"
                value={careerId ?? ''}
                onChange={(e) => setCareerId(e.target.value ? Number(e.target.value) : null)}
                disabled={exporting}
                className="bg-[#0f172a] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">Seleccione una carrera</option>
                {careers.map((career) => (
                  <option key={career.id} value={career.id}>
                    {career.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="report-gestion" className="text-xs text-slate-400">
                Gestión
              </label>
              <select
                id="report-gestion"
                value={gestionId ?? ''}
                onChange={(e) => setGestionId(e.target.value ? Number(e.target.value) : null)}
                disabled={exporting}
                className="bg-[#0f172a] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">Seleccione una gestión</option>
                {gestiones.map((gestion) => (
                  <option key={gestion.id} value={gestion.id}>
                    {gestion.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportResearchAgenda}
            disabled={exporting || careerId === null || gestionId === null}
            title={
              careerId === null || gestionId === null
                ? 'Seleccione una carrera y una gestión para exportar'
                : 'Exportar agenda científica como PDF'
            }
            className="mt-auto bg-blue-600 hover:bg-blue-700 disabled:bg-[#1e293b] disabled:hover:bg-[#1e293b] disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors w-full"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Generando PDF...' : 'Exportar agenda PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
