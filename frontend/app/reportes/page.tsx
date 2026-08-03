"use client";

import { useEffect, useRef, useState } from 'react';
import { FileText, Download, Clock } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import PageHeader from '@/components/layout/PageHeader';
import {
  api,
  type Career,
  type Gestion,
  type ReportFormat,
  type ReportType,
} from '@/lib/api';

export default function ReportesPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [careerId, setCareerId] = useState<number | null>(null);
  const [gestionId, setGestionId] = useState<number | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleExport = async (
    exportKey: string,
    format: ReportFormat,
    reportType: ReportType,
    successMessage: string
  ) => {
    if (careerId === null || gestionId === null) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setExporting(exportKey);

    try {
      const { task_id } = await api.reports.generate({
        career_id: careerId,
        gestion_id: gestionId,
        format,
        report_type: reportType,
      });

      const pollStatus = async (taskId: string, attempt: number): Promise<void> => {
        try {
          const status = await api.reports.status(taskId);

          if (status.status === 'completed') {
            const blob = await api.reports.download(taskId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = status.result?.file_name || `reporte-${taskId}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            setExporting(null);
            toast.success(successMessage);
          } else if (status.status === 'failed') {
            throw new Error(status.error || 'Error generando el reporte');
          } else if (attempt >= 60) {
            throw new Error(
              'La generación del reporte tardó demasiado. Intente nuevamente.'
            );
          } else {
            timeoutRef.current = setTimeout(
              () => pollStatus(taskId, attempt + 1),
              2000
            );
          }
        } catch (err) {
          setExporting(null);
          toast.error(
            err instanceof Error ? err.message : 'Error exportando el reporte'
          );
        }
      };

      timeoutRef.current = setTimeout(() => pollStatus(task_id, 1), 2000);
    } catch (err) {
      setExporting(null);
      toast.error('Error iniciando la exportación del reporte');
    }
  };

  const selectorsDisabled = exporting !== null;
  const selectionMissing = careerId === null || gestionId === null;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <PageHeader
        title="Generación de Reportes"
        description="Selecciona una carrera y una gestión, luego exporta el reporte que necesites."
      />

      {/* Shared career/gestión selectors */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <label htmlFor="report-career" className="text-xs text-slate-400">
            Carrera
          </label>
          <select
            id="report-career"
            value={careerId ?? ''}
            onChange={(e) => setCareerId(e.target.value ? Number(e.target.value) : null)}
            disabled={selectorsDisabled}
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

        <div className="flex flex-col gap-1 flex-1">
          <label htmlFor="report-gestion" className="text-xs text-slate-400">
            Gestión
          </label>
          <select
            id="report-gestion"
            value={gestionId ?? ''}
            onChange={(e) => setGestionId(e.target.value ? Number(e.target.value) : null)}
            disabled={selectorsDisabled}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
          <div className="w-10 h-10 rounded bg-primary/20 text-primary flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-medium text-lg">Reporte de Conflictos</h4>
            <p className="text-sm text-slate-400 mt-1">
              Lista de cruces detectados entre agenda académica y científica.
            </p>
          </div>
          <button
            disabled
            title="Este reporte aún no está disponible en el backend"
            className="mt-auto bg-[#1e293b] border border-[var(--border)] px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 w-full opacity-50 cursor-not-allowed"
          >
            <Clock className="w-4 h-4" />
            Próximamente
          </button>
        </div>

        <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
          <div className="w-10 h-10 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-medium text-lg">Agenda Consolidada</h4>
            <p className="text-sm text-slate-400 mt-1">
              Exportación completa del calendario fusionado por carrera.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              handleExport('consolidada', 'excel', 'table', 'Agenda consolidada exportada correctamente')
            }
            disabled={exporting !== null || selectionMissing}
            title={
              selectionMissing
                ? 'Seleccione una carrera y una gestión para exportar'
                : 'Exportar agenda consolidada como Excel'
            }
            className="mt-auto bg-blue-600 hover:bg-blue-700 disabled:bg-[#1e293b] disabled:hover:bg-[#1e293b] disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors w-full"
          >
            <Download className="w-4 h-4" />
            {exporting === 'consolidada' ? 'Generando Excel...' : 'Exportar Excel'}
          </button>
        </div>

        <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
          <div className="w-10 h-10 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-medium text-lg">Agenda Científica</h4>
            <p className="text-sm text-slate-400 mt-1">
              Exporta la agenda científica mensual de una carrera y gestión.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              handleExport('cientifica', 'pdf', 'research-agenda', 'Agenda científica exportada correctamente')
            }
            disabled={exporting !== null || selectionMissing}
            title={
              selectionMissing
                ? 'Seleccione una carrera y una gestión para exportar'
                : 'Exportar agenda científica como PDF'
            }
            className="mt-auto bg-blue-600 hover:bg-blue-700 disabled:bg-[#1e293b] disabled:hover:bg-[#1e293b] disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors w-full"
          >
            <Download className="w-4 h-4" />
            {exporting === 'cientifica' ? 'Generando PDF...' : 'Exportar agenda PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
