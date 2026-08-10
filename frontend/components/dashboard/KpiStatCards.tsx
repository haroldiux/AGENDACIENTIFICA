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
          className="rounded-2xl border border-white/6 bg-slate-900/60 backdrop-blur-sm shadow-lg p-5 flex flex-col justify-between gap-3 hover:border-white/10 hover:shadow-xl transition-all duration-200 group"
          style={{ '--stat-accent': accent } as React.CSSProperties}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-slate-300 transition-colors">
              {label}
            </span>
            <div className={`p-2 rounded-lg flex items-center justify-center shadow-[0_0_15px_var(--stat-accent)] shadow-transparent group-hover:shadow-[0_0_15px_var(--stat-accent)]/20 transition-all duration-300 ${chipClass}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
            <div className="mt-2">
              <span className="inline-block px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-400">
                {hint}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
