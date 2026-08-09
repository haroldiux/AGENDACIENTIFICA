"use client";

import { useEffect, useRef, useState } from 'react';
import { FileText, Download, Eye, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import PageHeader from '@/components/layout/PageHeader';
import {
  api,
  type Career,
  type Gestion,
  type ReportFormat,
  type ReportType,
  type ConflictItem,
} from '@/lib/api';

import { useUser } from '@/context/AuthContext';

export default function ReportesPage() {
  const { user } = useUser();
  const [careers, setCareers] = useState<Career[]>([]);
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [careerId, setCareerId] = useState<number | null>(null);
  const [gestionId, setGestionId] = useState<number | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [conflictsOpen, setConflictsOpen] = useState(false);
  const [loadingConflicts, setLoadingConflicts] = useState(false);
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
          let filteredCareers = careersData;
          const globalRoles = ['vicerrectorado', 'director_investigacion', 'super_admin', 'admin'];
          if (user && !globalRoles.includes(user.role)) {
            const userCareerIds = user.careers.map((c) => c.id);
            if (userCareerIds.length > 0) {
              filteredCareers = careersData.filter((c) => userCareerIds.includes(c.id));
            }
          }
          setCareers(filteredCareers);
          setGestiones(gestionesData);

          // Auto-select active gestion based on current date
          const today = new Date();
          const activeGestion = gestionesData.find((g) => {
            const start = new Date(g.start_date);
            const end = new Date(g.end_date);
            return today >= start && today <= end;
          });

          if (activeGestion && gestionId === null) {
            setGestionId(activeGestion.id);
          } else if (gestionesData.length > 0 && gestionId === null) {
            const mostRecent = [...gestionesData].sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime())[0];
            setGestionId(mostRecent.id);
          }

          // Auto-select career for restricted single-career users
          if (filteredCareers.length === 1 && user && !globalRoles.includes(user.role) && careerId === null) {
            setCareerId(filteredCareers[0].id);
          }
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
  }, [user]);

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
    if (gestionId === null) return;

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

  const handleLoadConflicts = async () => {
    if (gestionId === null) return;

    setLoadingConflicts(true);
    setConflictsOpen(true);

    try {
      const data = await api.conflicts.list({
        career_id: careerId,
        gestion_id: gestionId,
      });
      setConflicts(data.conflicts);
    } catch (err) {
      console.error('Error loading conflicts:', err);
      toast.error('Error cargando lista de conflictos');
      setConflicts([]);
    } finally {
      setLoadingConflicts(false);
    }
  };

  const selectorsDisabled = exporting !== null;
  const selectionMissing = gestionId === null;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <PageHeader
        title="Generación de Reportes"
        description="Selecciona una carrera y una gestión, luego exporta el reporte que necesites."
      />

      {/* Shared career/gestión selectors */}
      <div className="bg-card text-card-foreground border border-border shadow-sm p-4 rounded-xl flex flex-col md:flex-row gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <label htmlFor="report-career" className="text-xs text-slate-400">
            Carrera
          </label>
          <select
            id="report-career"
            value={careerId ?? ''}
            onChange={(e) => setCareerId(e.target.value ? Number(e.target.value) : null)}
            disabled={selectorsDisabled}
            className="bg-background text-foreground border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
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
            className="bg-background text-foreground border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
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
        <div className="bg-card text-card-foreground border border-border shadow-sm p-6 rounded-xl flex flex-col gap-4">
          <div className="w-10 h-10 rounded bg-primary/20 text-primary flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-medium text-lg">Reporte de Conflictos</h4>
            <p className="text-sm text-slate-400 mt-1">
              Lista de cruces detectados entre agenda académica y científica.
            </p>
          </div>
          <div className="mt-auto flex flex-col gap-2">
            <button
              type="button"
              onClick={() =>
                handleExport(
                  'conflict-pdf',
                  'pdf',
                  'conflict',
                  'Reporte de conflictos PDF exportado correctamente'
                )
              }
              disabled={exporting !== null || selectionMissing}
              title={
                selectionMissing
                  ? 'Seleccione una carrera y una gestión para exportar'
                  : 'Exportar conflictos como PDF'
              }
              className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors w-full"
            >
              <Download className="w-4 h-4" />
              {exporting === 'conflict-pdf'
                ? 'Generando PDF...'
                : 'Exportar PDF'}
            </button>
            <button
              type="button"
              onClick={() =>
                handleExport(
                  'conflict-excel',
                  'excel',
                  'conflict',
                  'Reporte de conflictos Excel exportado correctamente'
                )
              }
              disabled={exporting !== null || selectionMissing}
              title={
                selectionMissing
                  ? 'Seleccione una carrera y una gestión para exportar'
                  : 'Exportar conflictos como Excel'
              }
              className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors w-full"
            >
              <Download className="w-4 h-4" />
              {exporting === 'conflict-excel'
                ? 'Generando Excel...'
                : 'Exportar Excel'}
            </button>
            <button
              type="button"
              onClick={handleLoadConflicts}
              disabled={selectionMissing}
              title={
                selectionMissing
                  ? 'Seleccione una carrera y una gestión para ver conflictos'
                  : 'Ver lista de conflictos'
              }
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors w-full"
            >
              <Eye className="w-4 h-4" />
              Ver conflictos
            </button>
          </div>
        </div>

        <div className="bg-card text-card-foreground border border-border shadow-sm p-6 rounded-xl flex flex-col gap-4">
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
            className="mt-auto bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors w-full"
          >
            <Download className="w-4 h-4" />
            {exporting === 'consolidada' ? 'Generando Excel...' : 'Exportar Excel'}
          </button>
        </div>

        <div className="bg-card text-card-foreground border border-border shadow-sm p-6 rounded-xl flex flex-col gap-4">
          <div className="w-10 h-10 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-medium text-lg">Agendas PDF (Visual)</h4>
            <p className="text-sm text-slate-400 mt-1">
              Exporta las actividades en un calendario ilustrado listo para imprimir.
            </p>
          </div>
          <div className="mt-auto flex flex-col gap-2">
            <button
              type="button"
              onClick={() =>
                handleExport('agenda-completa', 'pdf', 'agenda-completa', 'Agenda completa exportada correctamente')
              }
              disabled={exporting !== null || selectionMissing}
              title={selectionMissing ? 'Seleccione opciones' : 'Exportar agenda completa'}
              className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors w-full"
            >
              <Download className="w-4 h-4" />
              {exporting === 'agenda-completa' ? 'Generando...' : 'Exportar Completa'}
            </button>
            <button
              type="button"
              onClick={() =>
                handleExport('agenda-academica', 'pdf', 'agenda-academica', 'Agenda académica exportada correctamente')
              }
              disabled={exporting !== null || selectionMissing}
              title={selectionMissing ? 'Seleccione opciones' : 'Exportar agenda académica'}
              className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors w-full"
            >
              <Download className="w-4 h-4" />
              {exporting === 'agenda-academica' ? 'Generando...' : 'Exportar Académica'}
            </button>
            <button
              type="button"
              onClick={() =>
                handleExport('agenda-cientifica', 'pdf', 'agenda-cientifica', 'Agenda científica exportada correctamente')
              }
              disabled={exporting !== null || selectionMissing}
              title={selectionMissing ? 'Seleccione opciones' : 'Exportar agenda científica'}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors w-full"
            >
              <Download className="w-4 h-4" />
              {exporting === 'agenda-cientifica' ? 'Generando...' : 'Exportar Científica'}
            </button>
          </div>
        </div>
      </div>

      {conflictsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card text-card-foreground border border-border shadow-sm w-full max-w-4xl max-h-[80vh] overflow-hidden rounded-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h3 className="font-medium text-lg">Conflictos detectados</h3>
              <button
                type="button"
                onClick={() => setConflictsOpen(false)}
                className="p-1 rounded hover:bg-white/10"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto">
              {loadingConflicts ? (
                <p className="text-sm text-slate-400">Cargando conflictos...</p>
              ) : conflicts.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No se encontraron conflictos para la carrera y gestión
                  seleccionadas.
                </p>
              ) : (
                <ul className="space-y-3">
                  {conflicts.map((conflict) => (
                    <li
                      key={`${conflict.academic_id}-${conflict.scientific_id}`}
                      className="border border-[var(--border)] rounded-lg p-3 text-sm"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <p className="font-medium">
                            {conflict.academic_title}
                          </p>
                          <p className="text-slate-400 text-xs">
                            Académica · {conflict.academic_start_date} al{' '}
                            {conflict.academic_end_date}
                          </p>
                        </div>
                        <div className="md:text-right">
                          <p className="font-medium">
                            {conflict.scientific_title}
                          </p>
                          <p className="text-slate-400 text-xs">
                            Científica ·{' '}
                            {conflict.scientific_start_date} al{' '}
                            {conflict.scientific_end_date}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
