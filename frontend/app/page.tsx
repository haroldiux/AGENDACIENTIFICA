'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ChevronRight,
  Loader2,
  FileUp,
  FlaskConical,
  User,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { api, type DashboardStats, type Career, type Gestion } from '@/lib/api';
import { activityTypeLabels } from '@/components/agenda/agenda-helpers';
import PageHeader from '@/components/layout/PageHeader';
import { useUser } from '@/context/AuthContext';

import DashboardFilters from '@/components/dashboard/DashboardFilters';
import KpiStatCards from '@/components/dashboard/KpiStatCards';
import ExecutionGauge from '@/components/dashboard/ExecutionGauge';
import MonthlyTimelineChart from '@/components/dashboard/MonthlyTimelineChart';
import CareerFacultyChart from '@/components/dashboard/CareerFacultyChart';
import AuditFeedWidget from '@/components/dashboard/AuditFeedWidget';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  in_progress: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  cancelled: 'bg-red-500/15 text-red-300 border-red-500/30',
};

const statusDotColors: Record<string, string> = {
  scheduled: 'bg-blue-400',
  in_progress: 'bg-amber-400',
  completed: 'bg-emerald-400',
  cancelled: 'bg-red-400',
};

const statusLabels: Record<string, string> = {
  scheduled: 'Programada',
  in_progress: 'En progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

function formatShortDate(dateStr: string): string {
  try {
    const d = new Date(`${dateStr}T12:00:00`);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

export default function Dashboard() {
  const { user } = useUser();

  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);

  const [selectedGestionId, setSelectedGestionId] = useState<number | null>(null);
  const [selectedCareerId, setSelectedCareerId] = useState<number | null>(null);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingStats, setFetchingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial dropdown options
  useEffect(() => {
    let cancelled = false;
    Promise.all([api.gestiones.list(), api.careers.list()])
      .then(([gList, cList]) => {
        if (!cancelled) {
          setGestiones(gList);
          setCareers(cList);
        }
      })
      .catch((err) => {
        console.error('Error cargando listas de filtrado', err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch stats when filters change
  const fetchStats = useCallback((gId: number | null, cId: number | null) => {
    setFetchingStats(true);
    const filters = {
      ...(gId ? { gestion_id: gId } : {}),
      ...(cId ? { career_id: cId } : {}),
    };

    api.dashboard
      .stats(filters)
      .then((data) => {
        setStats(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error cargando estadísticas');
        toast.error('No se pudieron cargar las estadísticas del dashboard');
      })
      .finally(() => {
        setLoading(false);
        setFetchingStats(false);
      });
  }, []);

  useEffect(() => {
    fetchStats(selectedGestionId, selectedCareerId);
  }, [selectedGestionId, selectedCareerId, fetchStats]);

  const handleGestionChange = (gId: number | null) => {
    setSelectedGestionId(gId);
  };

  const handleCareerChange = (cId: number | null) => {
    setSelectedCareerId(cId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-card text-card-foreground border border-border shadow-sm p-8 rounded-2xl text-center max-w-lg mx-auto mt-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-red-300">Error cargando el dashboard</h3>
        <p className="text-slate-400 mt-1 text-sm">{error}</p>
        <button
          onClick={() => fetchStats(selectedGestionId, selectedCareerId)}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const { counts, status_breakdown, next_events, active_gestion, monthly_timeline, career_breakdown, recent_audits } = stats;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800/80 to-slate-900 rounded-2xl border border-white/8 shadow-2xl p-6">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-violet-500/20 blur-3xl opacity-40 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Bienvenido, {user?.full_name || 'Usuario'}
            </h1>
            <p className="text-slate-400 mt-1">
              Dashboard de Analítica Científica
            </p>
          </div>
          {active_gestion.name && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                Gestión Activa: {active_gestion.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {user && !user.phone_number && !user.telegram_chat_id && (
        <Link
          href="/perfil"
          className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200 hover:bg-amber-500/15 transition-colors"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-sm">Completá tus datos de contacto</p>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Agregá tu WhatsApp o Telegram para recibir resúmenes semanales de actividades.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-amber-300">
            <User className="w-4 h-4" />
            Ir a perfil
          </div>
        </Link>
      )}

      {/* Filter Toolbar */}
      <DashboardFilters
        gestiones={gestiones}
        careers={careers}
        selectedGestionId={selectedGestionId}
        selectedCareerId={selectedCareerId}
        onGestionChange={handleGestionChange}
        onCareerChange={handleCareerChange}
        disabled={fetchingStats}
      />

      {/* Primary KPI Cards */}
      <KpiStatCards counts={counts} />

      {/* Execution Rate & Status Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ExecutionGauge
          rate={counts.completion_rate}
          completed={counts.completed_scientific}
          total={counts.total_scientific}
        />

        <div className="lg:col-span-2 rounded-2xl border border-white/6 bg-slate-900/60 backdrop-blur-sm shadow-xl p-0 flex flex-col justify-between">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wide text-slate-200">
              Estado de Actividades Científicas
            </h3>
            <span className="text-xs text-slate-500">Total: {counts.total_scientific}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 my-auto">
            {['scheduled', 'in_progress', 'completed', 'cancelled'].map((stKey) => {
              const cnt = status_breakdown[stKey] || 0;
              return (
                <div
                  key={stKey}
                  className={`rounded-xl p-4 text-center border transition-all ${
                    statusColors[stKey] || 'bg-slate-500/15 text-slate-300 border-slate-500/30'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${statusDotColors[stKey] || 'bg-slate-400'}`} />
                    <span className="text-xs font-medium">{statusLabels[stKey] || stKey}</span>
                  </div>
                  <p className="text-3xl font-extrabold mt-2 text-white">{cnt}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyTimelineChart data={monthly_timeline || []} />
        <CareerFacultyChart data={career_breakdown || []} />
      </div>

      {/* Activity Audit Feed & Next Scientific Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AuditFeedWidget audits={recent_audits || []} />

        <div className="rounded-2xl border border-white/6 bg-slate-900/60 backdrop-blur-sm shadow-xl flex flex-col justify-between overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wide text-slate-200">
              Próximos Eventos Científicos
            </h3>
            <Link
              href="/calendario"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              Ver calendario completo <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {next_events.length === 0 ? (
            <p className="text-slate-500 text-sm py-8 text-center">
              No hay eventos científicos próximos.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-slate-400 text-xs uppercase tracking-wider">
                    <th className="pb-3 font-medium">Fecha</th>
                    <th className="pb-3 font-medium">Título</th>
                    <th className="pb-3 font-medium">Tipo</th>
                    <th className="pb-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {next_events.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 text-xs font-mono whitespace-nowrap text-slate-300">
                        {formatShortDate(event.start_date)}
                      </td>
                      <td className="py-3 font-medium text-xs text-white max-w-[160px] truncate">
                        {event.title}
                      </td>
                      <td className="py-3">
                        {event.activity_type && (
                          <span className="bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded text-[11px]">
                            {activityTypeLabels[event.activity_type] || event.activity_type}
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        {event.status && (
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] border ${
                              statusColors[event.status] || ''
                            }`}
                          >
                            {statusLabels[event.status] || event.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Access Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link
          href="/actividades"
          className="rounded-2xl border border-white/6 bg-slate-900/60 backdrop-blur-sm shadow-xl p-6 hover:bg-slate-800/80 hover:border-blue-500/40 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-violet-500/15 text-violet-400">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                  Gestionar Actividades Científicas
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Crear, editar, adjuntar evidencias y dar seguimiento a actividades.
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link
          href="/importar"
          className="rounded-2xl border border-white/6 bg-slate-900/60 backdrop-blur-sm shadow-xl p-6 hover:bg-slate-800/80 hover:border-blue-500/40 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400">
                <FileUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                  Importar Calendario Académico
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Cargar planillas Excel para fusionar actividades académicas en la agenda.
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>
    </div>
  );
}
