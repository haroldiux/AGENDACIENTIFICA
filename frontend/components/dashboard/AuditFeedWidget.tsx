'use client';

import { Activity, Clock, UserCheck } from 'lucide-react';
import { AuditFeedItem } from '@/lib/api';

interface AuditFeedWidgetProps {
  audits: AuditFeedItem[];
}

const actionLabels: Record<string, { label: string; color: string }> = {
  CREACION:            { label: 'Creación',    color: 'bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-300' },
  EDICION:             { label: 'Edición',     color: 'bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-300' },
  CAMBIO_ESTADO:       { label: 'Estado',      color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-300' },
  SUBIDA_EVIDENCIA:    { label: 'Evidencia +', color: 'bg-violet-500/15 text-violet-600 border-violet-500/30 dark:text-violet-300' },
  ELIMINACION_EVIDENCIA: { label: 'Evidencia -', color: 'bg-rose-500/15 text-rose-600 border-rose-500/30 dark:text-rose-300' },
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
    <div className="rounded-2xl border border-border bg-surface shadow-[var(--shadow-glass)] p-0 flex flex-col justify-between dark:bg-surface/80 dark:backdrop-blur-sm dark:border-white/6">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Activity className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <h3 className="text-sm font-semibold tracking-wide text-foreground">
            Feed de Auditoría Reciente
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">Últimos cambios</span>
      </div>

      {audits.length === 0 ? (
        <p className="text-muted-foreground text-sm py-6 text-center">
          No hay registros de auditoría recientes.
        </p>
      ) : (
        <div className="divide-y divide-border max-h-[320px] overflow-y-auto dark:divide-white/5">
          {audits.map((item) => {
            const badge = actionLabels[item.action] || {
              label: item.action,
              color: 'bg-muted text-muted-foreground border-border',
            };

            return (
              <div
                key={item.id}
                className="flex items-start gap-4 px-5 py-4 hover:bg-muted/40 transition-colors dark:hover:bg-white/[0.02]"
              >
                <div className="p-2 bg-muted rounded-lg shrink-0 mt-0.5">
                  <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {item.title}
                    </p>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] border font-medium shrink-0 ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                    <span className="truncate">
                      {item.user_name || 'Usuario'}
                      {item.role && <span className="opacity-75"> ({item.role})</span>}
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
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
