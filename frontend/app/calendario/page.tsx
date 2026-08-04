'use client';

import { useEffect, useState, useRef } from 'react';
import { Download, LayoutGrid, List } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  api,
  type Career,
  type Gestion,
  type MergedCalendarItem,
} from '@/lib/api';
import CalendarView from '@/components/calendar/CalendarView';
import CalendarLegend from '@/components/calendar/CalendarLegend';
import PageHeader from '@/components/layout/PageHeader';
import AgendaFilterBar from '@/components/agenda/AgendaFilterBar';
import AgendaNoCareerSelected from '@/components/agenda/AgendaNoCareerSelected';
import AgendaSkeleton from '@/components/agenda/AgendaSkeleton';
import AgendaErrorState from '@/components/agenda/AgendaErrorState';

export default function CalendarioPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [careerId, setCareerId] = useState<number | null>(null);
  const [gestionId, setGestionId] = useState<number | null>(null);
  const [items, setItems] = useState<MergedCalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [exporting, setExporting] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Fetch merged calendar when filters change.
  useEffect(() => {
    if (careerId === null) {
      setItems([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    const loadCalendar = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.fusion.getMerged({
          career_id: careerId,
          gestion_id: gestionId ?? undefined,
        });
        if (!cancelled) {
          setItems(data.items ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo cargar el calendario. Intente de nuevo.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadCalendar();
    return () => {
      cancelled = true;
    };
  }, [careerId, gestionId, retryToken]);

  // Clean up any active polling timeout on unmount.
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleExportPDF = async () => {
    if (careerId === null || gestionId === null) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setExporting(true);

    try {
      const { task_id } = await api.reports.generate({
        career_id: careerId,
        gestion_id: gestionId,
        format: 'pdf',
        report_type: 'research-agenda',
      });

      const pollStatus = async (taskId: string, attempt: number): Promise<void> => {
        try {
          const status = await api.reports.status(taskId);

          if (status.status === 'completed') {
            const blob = await api.reports.download(taskId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = status.result?.file_name || `agenda-${taskId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            setExporting(false);
            toast.success('Agenda exportada correctamente');
          } else if (status.status === 'failed') {
            throw new Error(status.error || 'Error generando el PDF');
          } else if (attempt >= 60) {
            throw new Error(
              'La generación del PDF tardó demasiado. Intente nuevamente.'
            );
          } else {
            timeoutRef.current = setTimeout(
              () => pollStatus(taskId, attempt + 1),
              2000
            );
          }
        } catch (err) {
          setExporting(false);
          toast.error(
            err instanceof Error ? err.message : 'Error exportando el PDF'
          );
        }
      };

      timeoutRef.current = setTimeout(() => pollStatus(task_id, 1), 2000);
    } catch (err) {
      setExporting(false);
      toast.error('Error iniciando la exportación del PDF');
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    // Save previous items for rollback
    const previousItems = [...items];

    // Optimistic update
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.source_type === 'scientific'
          ? { ...item, status: newStatus as any }
          : item
      )
    );

    try {
      await api.scientific.updateStatus(id, newStatus as any);
      toast.success('Estado actualizado correctamente');
    } catch (err) {
      // Revert
      setItems(previousItems);
      toast.error('Error al actualizar el estado');
    }
  };

  const academicCount = items.filter((i) => i.source_type === 'academic').length;
  const scientificCount = items.filter((i) => i.source_type === 'scientific').length;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <PageHeader
        title="Calendario Fusionado"
        description="Actividades académicas y científicas en una sola vista. Selecciona una carrera para comenzar."
      />

      {/* Top bar with filters and actions */}
      <Card className="p-4 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between shadow-sm">
        <AgendaFilterBar
          careers={careers}
          gestiones={gestiones}
          careerId={careerId}
          gestionId={gestionId}
          onCareerChange={setCareerId}
          onGestionChange={setGestionId}
          disabled={exporting}
        />

        <div className="flex items-center gap-3 shrink-0">
          {careerId !== null && (
            <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground mr-2">
              <span className="flex items-center gap-1">
                <LayoutGrid className="w-3.5 h-3.5" />
                {academicCount} académicas
              </span>
              <span className="flex items-center gap-1">
                <List className="w-3.5 h-3.5" />
                {scientificCount} científicas
              </span>
            </div>
          )}
          <Button
            type="button"
            onClick={handleExportPDF}
            disabled={exporting || careerId === null || gestionId === null}
            title={
              careerId === null || gestionId === null
                ? 'Seleccione una carrera y una gestión para exportar'
                : 'Exportar agenda como PDF'
            }
            className="flex items-center gap-2 shrink-0"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Generando PDF...' : 'Exportar agenda PDF'}
          </Button>
        </div>
      </Card>

      {/* Main content */}
      {careerId === null ? (
        <AgendaNoCareerSelected />
      ) : error ? (
        <AgendaErrorState
          message={error}
          onRetry={() => setRetryToken((token) => token + 1)}
        />
      ) : (
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <CalendarView items={items} isLoading={isLoading} onStatusChange={handleStatusChange} />
          </div>
          <div className="xl:w-72 shrink-0">
            <CalendarLegend />
          </div>
        </div>
      )}
    </div>
  );
}
