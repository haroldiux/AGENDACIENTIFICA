'use client';

import { useEffect, useState, useRef } from 'react';
import { Calendar, Download, LayoutGrid, List, Search, X, BookOpen, FlaskConical, FileText } from 'lucide-react';
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
import CalendarLegend, { type ActiveLegendFilter } from '@/components/calendar/CalendarLegend';
import PageHeader from '@/components/layout/PageHeader';
import AgendaFilterBar from '@/components/agenda/AgendaFilterBar';
import AgendaNoCareerSelected from '@/components/agenda/AgendaNoCareerSelected';
import AgendaSkeleton from '@/components/agenda/AgendaSkeleton';
import AgendaErrorState from '@/components/agenda/AgendaErrorState';
import { useUser } from '@/context/AuthContext';
const READ_ONLY_ROLES = ['read_only'];

export default function CalendarioPage() {
  const { user } = useUser();
  const isReadOnly = !!user && READ_ONLY_ROLES.includes(user.role);

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
  const [activeLegendFilter, setActiveLegendFilter] = useState<ActiveLegendFilter | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleExportICS = () => {
    const url = api.fusion.exportIcsUrl({
      career_id: careerId ?? undefined,
      gestion_id: gestionId ?? undefined,
    });
    window.open(url, '_blank');
    toast.success('Descargando calendario iCalendar (.ics)');
  };

  useEffect(() => {
    let cancelled = false;
    const loadSelectors = async () => {
      try {
        const [careersData, gestionesData] = await Promise.all([
          api.careers.list(),
          api.gestiones.list(),
        ]);
        if (!cancelled) {
          // Filter careers based on user role
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
          
          // Select active gestion by checking current date
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
          
          // Default career for restricted users with single career
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

  // Fetch merged calendar when filters change.
  useEffect(() => {
    let cancelled = false;
    const loadCalendar = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.fusion.getMerged({
          career_id: careerId ?? undefined,
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
      toast.error('Error exportando el PDF');
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
    if (activeLegendFilter) {
      const { group, key } = activeLegendFilter;
      if (group === 'academic') {
        const itemCat = (item.category || 'default').toLowerCase();
        if (itemCat !== key) return false;
      } else if (group === 'scientific') {
        const itemType = (item.activity_type || 'congreso').toLowerCase();
        if (itemType !== key) return false;
      } else if (group === 'scope') {
        if (key === 'global' && !(item.scope === 'global' || item.career_id === null)) return false;
        if (key === 'scientific' && item.source_type !== 'scientific') return false;
        if (key === 'career' && (item.scope === 'global' || item.career_id === null || item.source_type !== 'academic')) return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <PageHeader
        title="Calendario Fusionado"
        description="Actividades académicas y científicas en una sola vista. Filtra por alcance global o por carrera."
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
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground mr-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              <BookOpen className="w-3.5 h-3.5" />
              {academicCount} académicas
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
              <FlaskConical className="w-3.5 h-3.5" />
              {scientificCount} científicas
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportICS}
            className="text-xs h-9 px-3 gap-1.5 font-medium border-border"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            Exportar (.ics)
          </Button>

          <div className="relative group">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={exporting || gestionId === null}
              className="text-xs h-9 px-3 gap-1.5 font-medium border-border"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              {exporting ? 'Exportando...' : 'Exportar PDF'}
            </Button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-popover text-popover-foreground border border-border rounded-lg shadow-lg p-1 min-w-[170px] z-50">
              <button
                onClick={() => handleExportPDF('agenda-completa')}
                disabled={exporting || gestionId === null}
                className="text-left px-3 py-1.5 text-xs hover:bg-accent rounded-md transition-colors flex items-center gap-2"
              >
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                Agenda Completa
              </button>
              <button
                onClick={() => handleExportPDF('agenda-academica')}
                disabled={exporting || gestionId === null}
                className="text-left px-3 py-1.5 text-xs hover:bg-accent rounded-md transition-colors flex items-center gap-2"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                Solo Académicas
              </button>
              <button
                onClick={() => handleExportPDF('agenda-cientifica')}
                disabled={exporting || gestionId === null}
                className="text-left px-3 py-1.5 text-xs hover:bg-accent rounded-md transition-colors flex items-center gap-2"
              >
                <FlaskConical className="w-3.5 h-3.5 text-pink-400" />
                Solo Investigación
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Search + type filter */}
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
          {[
            { id: 'all', label: 'Todas', icon: LayoutGrid },
            { id: 'academic', label: 'Académicas', icon: BookOpen },
            { id: 'scientific', label: 'Científicas', icon: FlaskConical },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTypeFilter(id as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                typeFilter === id
                  ? 'bg-background shadow text-foreground border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      {error ? (
        <AgendaErrorState
          message={error}
          onRetry={() => setRetryToken((token) => token + 1)}
        />
      ) : (
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <CalendarView items={filteredItems} isLoading={isLoading} onStatusChange={isReadOnly ? undefined : handleStatusChange} />
          </div>
          <div className="xl:w-72 shrink-0">
            <CalendarLegend
              activeFilter={activeLegendFilter}
              onFilterChange={setActiveLegendFilter}
            />
          </div>
        </div>
      )}
    </div>
  );
}
