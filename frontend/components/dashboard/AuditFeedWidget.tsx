'use client';

import { Activity, Clock, UserCheck } from 'lucide-react';
import { AuditFeedItem } from '@/lib/api';

interface AuditFeedWidgetProps {
  audits: AuditFeedItem[];
}

const actionLabels: Record<string, { label: string; color: string }> = {
  CREACION: { label: 'Creación', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  EDICION: { label: 'Edición', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  CAMBIO_ESTADO: { label: 'Estado', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  SUBIDA_EVIDENCIA: { label: 'Evidencia +', color: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
  ELIMINACION_EVIDENCIA: { label: 'Evidencia -', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
};

function formatAuditTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default function AuditFeedWidget({ audits }: AuditFeedWidgetProps) {
  return (
    <div className="bg-card text-card-foreground border border-border shadow-sm p-6 rounded-2xl flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-semibold tracking-wide text-slate-300">
            Feed de Auditoría Reciente
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">Últimos cambios</span>
      </div>

      {audits.length === 0 ? (
        <p className="text-slate-500 text-sm py-6 text-center">
          No hay registros de auditoría recientes.
        </p>
      ) : (
        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
          {audits.map((item) => {
            const badge = actionLabels[item.action] || {
              label: item.action,
              color: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
            };

            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-2.5 bg-slate-900/40 rounded-xl border border-slate-800/80 hover:bg-slate-900/70 transition-colors"
              >
                <div className="p-2 bg-slate-800 rounded-lg shrink-0 mt-0.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-300" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {item.title}
                    </p>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] border font-medium shrink-0 ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span className="truncate">
                      {item.user_name || 'Usuario'}
                      {item.role && <span className="opacity-75"> ({item.role})</span>}
                    </span>
                    <span className="flex items-center gap-1 shrink-0 text-slate-500">
                      <Clock className="w-3 h-3" />
                      {formatAuditTime(item.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
