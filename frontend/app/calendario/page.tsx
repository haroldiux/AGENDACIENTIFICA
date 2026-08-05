'use client';

import { useEffect, useState, useRef } from 'react';
import { Download, LayoutGrid, List, Search, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  api,
  type Career,
  type Gestion,
  type MergedCalendarItem,
  type ReportType,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'academic' | 'scientific'>('all');

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

  const handleExportPDF = async (reportType: ReportType = 'agenda-completa') => {
    if (gestionId === null) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setExporting(true);

    try {
      const { task_id } = await api.reports.generate({
        career_id: careerId,
        gestion_id: gestionId,
        format: 'pdf',
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

  const filteredItems = items.filter((item) => {
    if (typeFilter === 'academic' && item.source_type !== 'academic') return false;
    if (typeFilter === 'scientific' && item.source_type !== 'scientific') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!item.title.toLowerCase().includes(q)) return false;
    }
    return true;
  });

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
          <div className="flex items-center bg-muted/50 p-1 rounded-lg shrink-0 border border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleExportPDF('agenda-completa')}
              disabled={exporting || gestionId === null}
              className="text-xs px-2 h-8"
              title="Completa"
            >
              Completa
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleExportPDF('agenda-academica')}
              disabled={exporting || gestionId === null}
              className="text-xs px-2 h-8"
              title="Académica"
            >
              Académica
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleExportPDF('agenda-cientifica')}
              disabled={exporting || gestionId === null}
              className="text-xs px-2 h-8"
              title="Investigación"
            >
              <Download className="w-3 h-3 mr-1" />
              {exporting ? '...' : 'Investigación'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Search + type filter */}
      {careerId !== null && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar actividad por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border shrink-0">
            {(['all', 'academic', 'scientific'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  typeFilter === t
                    ? 'bg-background shadow text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'all' ? 'Todas' : t === 'academic' ? 'Académicas' : 'Científicas'}
              </button>
            ))}
          </div>
        </div>
      )}
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
            <CalendarView items={filteredItems} isLoading={isLoading} onStatusChange={handleStatusChange} />
          </div>
          <div className="xl:w-72 shrink-0">
            <CalendarLegend />
          </div>
        </div>
      )}
    </div>
  );
}
