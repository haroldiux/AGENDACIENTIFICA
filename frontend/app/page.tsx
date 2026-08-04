'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  FlaskConical,
  ClipboardList,
  AlertTriangle,
  ChevronRight,
  Loader2,
  FileUp,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { api, type DashboardStats } from '@/lib/api';
import { activityTypeLabels } from '@/components/agenda/agenda-helpers';
import PageHeader from '@/components/layout/PageHeader';

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
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.dashboard
      .stats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error cargando estadísticas');
          toast.error('No se pudo cargar el dashboard');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

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
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const { counts, status_breakdown, next_events, active_gestion } = stats;

  const statCards = [
    {
      label: 'Eventos Próximos',
      value: counts.upcoming_events,
      hint: 'Académicas + científicas',
      icon: CalendarDays,
      accent: '#3b82f6',
      chipClass: 'bg-blue-500/15 text-blue-400',
    },
    {
      label: 'Actividades Científicas',
      value: counts.total_scientific,
      hint: `${counts.upcoming_scientific} próximas`,
      icon: FlaskConical,
      accent: '#8b5cf6',
      chipClass: 'bg-violet-500/15 text-violet-400',
    },
    {
      label: 'Estados Pendientes',
      value: (status_breakdown.scheduled || 0) + (status_breakdown.in_progress || 0),
      hint: `${status_breakdown.scheduled || 0} programadas · ${status_breakdown.in_progress || 0} en progreso`,
      icon: ClipboardList,
      accent: '#f59e0b',
      chipClass: 'bg-amber-500/15 text-amber-400',
    },
  ];

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <PageHeader
        title="Dashboard"
        description={
          active_gestion.name
            ? `Resumen de la gestión activa: ${active_gestion.name}`
            : 'Resumen general del sistema de agenda científica'
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {statCards.map(({ label, value, hint, icon: Icon, accent, chipClass }) => (
          <div
            key={label}
            className="bg-card text-card-foreground border border-border shadow-sm stat-card p-6 rounded-2xl flex flex-col gap-3"
            style={{ '--stat-accent': accent } as React.CSSProperties}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">{label}</span>
              <div className={`icon-chip ${chipClass}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-4xl font-bold tracking-tight">{value}</p>
            <p className="text-xs text-slate-500">{hint}</p>
          </div>
        ))}
      </div>

      {/* Status Breakdown */}
      <div className="bg-card text-card-foreground border border-border shadow-sm p-6 rounded-2xl">
        <h3 className="text-base font-semibold mb-4">Estado de Actividades Científicas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(status_breakdown).map(([status, count]) => (
            <div
              key={status}
              className={`rounded-xl p-4 text-center border ${statusColors[status] || 'bg-slate-500/15 text-slate-300 border-slate-500/30'}`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${statusDotColors[status] || 'bg-slate-400'}`} />
                <span className="text-xs font-medium">{statusLabels[status] || status}</span>
              </div>
              <p className="text-3xl font-bold mt-2 text-white">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Next Events */}
      <div className="bg-card text-card-foreground border border-border shadow-sm p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Próximos Eventos Científicos</h3>
          <Link
            href="/calendario"
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            Ver calendario <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {next_events.length === 0 ? (
          <p className="text-slate-500 text-sm">No hay eventos científicos próximos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] text-slate-400 text-xs uppercase tracking-wider">
                  <th className="pb-3 font-medium">Fecha</th>
                  <th className="pb-3 font-medium">Título</th>
                  <th className="pb-3 font-medium">Tipo</th>
                  <th className="pb-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {next_events.map((event) => (
                  <tr key={event.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 text-sm whitespace-nowrap text-slate-300">
                      {formatShortDate(event.start_date)}
                    </td>
                    <td className="py-3.5 font-medium text-white">{event.title}</td>
                    <td className="py-3.5">
                      {event.activity_type && (
                        <span className="bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-md text-xs">
                          {activityTypeLabels[event.activity_type] || event.activity_type}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5">
                      {event.status && (
                        <span className={`px-2 py-0.5 rounded-md text-xs border ${statusColors[event.status] || ''}`}>
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

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link href="/actividades" className="bg-card text-card-foreground border border-border shadow-sm p-6 rounded-2xl hover:bg-white/[0.04] hover:border-blue-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="icon-chip bg-violet-500/15 text-violet-400">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-white group-hover:text-blue-300 transition-colors">
                  Gestionar Actividades
                </h4>
                <p className="text-sm text-slate-500 mt-1">
                  Crear, editar y dar seguimiento a actividades científicas
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link href="/importar" className="bg-card text-card-foreground border border-border shadow-sm p-6 rounded-2xl hover:bg-white/[0.04] hover:border-blue-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="icon-chip bg-emerald-500/15 text-emerald-400">
                <FileUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-white group-hover:text-blue-300 transition-colors">
                  Importar Calendario
                </h4>
                <p className="text-sm text-slate-500 mt-1">
                  Subir Excel con actividades académicas para fusionar
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
