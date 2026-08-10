"use client";

import { useEffect, useRef, useState } from 'react';
import { FileText, Download, Eye, X, BarChart3, TrendingUp, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import PageHeader from '@/components/layout/PageHeader';
import {
  api,
  type Career,
  type Gestion,
  type ReportFormat,
  type ReportType,
  type ConflictItem,
  type SeguimientoStatsResponse,
} from '@/lib/api';

import { useUser } from '@/context/AuthContext';

/** Converts '1-2026' -> 'Semestre 1 – 2026', leaves unknown formats as-is. */
function formatGestion(name: string): string {
  const match = name.match(/^([12])-(\d{4})$/);
  if (match) return `Semestre ${match[1]} – ${match[2]}`;
  return name;
}

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

  const [seguimientoData, setSeguimientoData] = useState<SeguimientoStatsResponse | null>(null);
  const [seguimientoOpen, setSeguimientoOpen] = useState(false);
  const [loadingSeguimiento, setLoadingSeguimiento] = useState(false);

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

  const [statusFilter, setStatusFilter] = useState<string>('');

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
        status_filter: statusFilter || undefined,
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

  const handleLoadSeguimiento = async () => {
    if (gestionId === null) return;

    setLoadingSeguimiento(true);
    setSeguimientoOpen(true);

    try {
      const data = await api.reports.getSeguimientoStats(gestionId, careerId);
      setSeguimientoData(data);
    } catch (err) {
      console.error('Error loading seguimiento stats:', err);
      toast.error('Error cargando métricas de seguimiento');
      setSeguimientoData(null);
    } finally {
      setLoadingSeguimiento(false);
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
                {formatGestion(gestion.name)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <label htmlFor="report-status" className="text-xs text-slate-400">
            Filtrar por Estado (Opcional)
          </label>
          <select
            id="report-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={selectorsDisabled}
            className="bg-background text-foreground border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            <option value="">Todos los estados</option>
            <option value="scheduled">Programadas</option>
            <option value="in_progress">En desarrollo</option>
            <option value="completed">Completadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card text-card-foreground border border-border shadow-sm p-6 rounded-xl flex flex-col gap-4">
          <div className="w-10 h-10 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-medium text-lg">Seguimiento y Cumplimiento</h4>
            <p className="text-sm text-slate-400 mt-1">
              Estadísticas de avance por carrera: Completadas, En Desarrollo, Canceladas y % de ejecución.
            </p>
          </div>
          <div className="mt-auto flex flex-col gap-2">
            <button
              type="button"
              onClick={() =>
                handleExport(
                  'seguimiento-pdf',
                  'pdf',
                  'seguimiento-cumplimiento',
                  'Reporte de seguimiento PDF exportado correctamente'
                )
              }
              disabled={exporting !== null || selectionMissing}
              title={selectionMissing ? 'Seleccione opciones' : 'Exportar reporte de seguimiento en PDF'}
              className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors w-full font-medium"
            >
              <Download className="w-4 h-4" />
              {exporting === 'seguimiento-pdf' ? 'Generando PDF...' : 'Exportar PDF'}
            </button>
            <button
              type="button"
              onClick={() =>
                handleExport(
                  'seguimiento-excel',
                  'excel',
                  'seguimiento-cumplimiento',
                  'Reporte de seguimiento Excel exportado correctamente'
                )
              }
              disabled={exporting !== null || selectionMissing}
              title={selectionMissing ? 'Seleccione opciones' : 'Exportar reporte de seguimiento en Excel'}
              className="bg-emerald-700/80 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors w-full font-medium"
            >
              <Download className="w-4 h-4" />
              {exporting === 'seguimiento-excel' ? 'Generando Excel...' : 'Exportar Excel'}
            </button>
            <button
              type="button"
              onClick={handleLoadSeguimiento}
              disabled={selectionMissing}
              title={selectionMissing ? 'Seleccione opciones' : 'Ver métricas de avance por carrera'}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors w-full font-medium"
            >
              <TrendingUp className="w-4 h-4" />
              Ver métricas de avance
            </button>
          </div>
        </div>

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

      {/* Seguimiento y Cumplimiento Metrics Modal */}
      {seguimientoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card text-card-foreground border border-border shadow-lg w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-muted/40">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-lg">Métricas de Avance y Cumplimiento</h3>
              </div>
              <button
                type="button"
                onClick={() => setSeguimientoOpen(false)}
                className="p-1 rounded hover:bg-white/10"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {loadingSeguimiento ? (
                <p className="text-sm text-slate-400 text-center py-8">Cargando métricas de avance por carrera...</p>
              ) : !seguimientoData ? (
                <p className="text-sm text-slate-400 text-center py-8">No se pudieron cargar los datos de avance.</p>
              ) : (
                <>
                  {/* Institutional Summary KPIs */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-muted/30 border border-border p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-foreground">{seguimientoData.totals.total}</div>
                      <div className="text-xs text-muted-foreground font-medium uppercase mt-0.5">Total Actividades</div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-blue-400">{seguimientoData.totals.in_progress}</div>
                      <div className="text-xs text-blue-400/80 font-medium uppercase mt-0.5">En Desarrollo</div>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-emerald-400">{seguimientoData.totals.completed}</div>
                      <div className="text-xs text-emerald-400/80 font-medium uppercase mt-0.5">Completadas</div>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-rose-400">{seguimientoData.totals.cancelled}</div>
                      <div className="text-xs text-rose-400/80 font-medium uppercase mt-0.5">Canceladas</div>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg text-center col-span-2 sm:col-span-1">
                      <div className="text-xl font-bold text-purple-400">{seguimientoData.totals.completion_rate}%</div>
                      <div className="text-xs text-purple-400/80 font-medium uppercase mt-0.5">% Cumplimiento</div>
                    </div>
                  </div>

                  {/* Careers Breakdown List */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-base text-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      Avance por Carrera / Alcance
                    </h4>

                    <div className="space-y-3">
                      {seguimientoData.careers_summary.map((row) => (
                        <div key={row.career_name} className="bg-muted/20 border border-border p-4 rounded-xl space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-sm text-foreground">{row.career_name}</span>
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              {row.completion_rate}% Completado
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
                            <div
                              style={{ width: `${row.total > 0 ? (row.completed / row.total) * 100 : 0}%` }}
                              className="bg-emerald-500 h-full"
                              title={`Completadas: ${row.completed}`}
                            />
                            <div
                              style={{ width: `${row.total > 0 ? (row.in_progress / row.total) * 100 : 0}%` }}
                              className="bg-blue-500 h-full"
                              title={`En Desarrollo: ${row.in_progress}`}
                            />
                            <div
                              style={{ width: `${row.total > 0 ? (row.cancelled / row.total) * 100 : 0}%` }}
                              className="bg-rose-500 h-full"
                              title={`Canceladas: ${row.cancelled}`}
                            />
                          </div>

                          {/* Stat Badges */}
                          <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-1">
                            <div className="flex items-center gap-4">
                              <span>Total: <strong className="text-foreground">{row.total}</strong></span>
                              <span className="text-blue-400 font-medium">En Desarrollo: <strong>{row.in_progress}</strong></span>
                              <span className="text-emerald-400 font-medium">Completadas: <strong>{row.completed}</strong></span>
                              <span className="text-rose-400 font-medium">Canceladas: <strong>{row.cancelled}</strong></span>
                            </div>
                            <span className="text-slate-400">Programadas: {row.scheduled}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
