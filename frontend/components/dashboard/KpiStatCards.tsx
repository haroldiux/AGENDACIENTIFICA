'use client';

import { CalendarDays, FlaskConical, Clock, CalendarCheck } from 'lucide-react';
import { DashboardStats } from '@/lib/api';

interface KpiStatCardsProps {
  counts: DashboardStats['counts'];
}

export default function KpiStatCards({ counts }: KpiStatCardsProps) {
  const cards = [
    {
      label: 'Actividades Académicas',
      value: counts.total_academic,
      hint: 'Gestión activa',
      icon: CalendarDays,
      accent: '#3b82f6',
      chipClass: 'bg-blue-500/15 text-blue-400',
    },
    {
      label: 'Actividades Científicas',
      value: counts.total_scientific,
      hint: `${counts.completed_scientific} completadas`,
      icon: FlaskConical,
      accent: '#8b5cf6',
      chipClass: 'bg-violet-500/15 text-violet-400',
    },
    {
      label: 'Próximos 7 Días',
      value: counts.upcoming_7_days,
      hint: 'Eventos inmediatos',
      icon: Clock,
      accent: '#f59e0b',
      chipClass: 'bg-amber-500/15 text-amber-400',
    },
    {
      label: 'Próximos 30 Días',
      value: counts.upcoming_30_days,
      hint: 'Planificación mensual',
      icon: CalendarCheck,
      accent: '#10b981',
      chipClass: 'bg-emerald-500/15 text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map(({ label, value, hint, icon: Icon, accent, chipClass }) => (
        <div
          key={label}
          className="bg-card text-card-foreground border border-border shadow-sm p-5 rounded-2xl flex flex-col justify-between gap-3 hover:border-slate-700/80 transition-all"
          style={{ '--stat-accent': accent } as React.CSSProperties}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {label}
            </span>
            <div className={`p-2 rounded-xl ${chipClass}`}>
              <Icon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold tracking-tight">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{hint}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
