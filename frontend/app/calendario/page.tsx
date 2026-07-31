"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import {
  api,
  type Career,
  type Gestion,
  type ScientificActivity,
} from '@/lib/api';
import AgendaFilterBar from '@/components/agenda/AgendaFilterBar';
import AgendaMonthGroup from '@/components/agenda/AgendaMonthGroup';
import AgendaNoCareerSelected from '@/components/agenda/AgendaNoCareerSelected';
import AgendaSkeleton from '@/components/agenda/AgendaSkeleton';
import AgendaEmptyState from '@/components/agenda/AgendaEmptyState';
import AgendaErrorState from '@/components/agenda/AgendaErrorState';
import { groupActivitiesByMonth } from '@/components/agenda/agenda-helpers';

export default function CalendarioPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [careerId, setCareerId] = useState<number | null>(null);
  const [gestionId, setGestionId] = useState<number | null>(null);
  const [activities, setActivities] = useState<ScientificActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [exporting, setExporting] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load selector options once on mount.
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

  // Fetch activities when filters change.
  useEffect(() => {
    if (careerId === null) {
      setActivities([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    const loadActivities = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.scientific.list({
          career_id: careerId,
          gestion_id: gestionId ?? undefined,
        });
        if (!cancelled) {
          setActivities(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo cargar la agenda. Intente de nuevo.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadActivities();
    return () => {
      cancelled = true;
    };
  }, [careerId, gestionId, retryToken]);

  // Clean up any active polling interval on unmount.
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const monthGroups = useMemo(
    () => groupActivitiesByMonth(activities),
    [activities]
  );

  const handleExportPDF = async () => {
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
            toast.success('Agenda exportada correctamente');
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

      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <AgendaFilterBar
          careers={careers}
          gestiones={gestiones}
          careerId={careerId}
          gestionId={gestionId}
          onCareerChange={setCareerId}
          onGestionChange={setGestionId}
          disabled={exporting}
        />

        <button
          type="button"
          onClick={handleExportPDF}
          disabled={exporting || careerId === null || gestionId === null}
          title={
            careerId === null || gestionId === null
              ? 'Seleccione una carrera y una gestión para exportar'
              : 'Exportar agenda como PDF'
          }
          className="px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Generando PDF...' : 'Exportar agenda PDF'}
        </button>
      </div>

      <div className="min-h-[400px]">
        {careerId === null ? (
          <AgendaNoCareerSelected />
        ) : isLoading ? (
          <AgendaSkeleton />
        ) : error ? (
          <AgendaErrorState
            message={error}
            onRetry={() => setRetryToken((token) => token + 1)}
          />
        ) : monthGroups.length === 0 ? (
          <AgendaEmptyState />
        ) : (
          <div className="space-y-8">
            {monthGroups.map((group) => (
              <AgendaMonthGroup
                key={group.monthKey}
                monthKey={group.monthKey}
                activities={group.activities}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
