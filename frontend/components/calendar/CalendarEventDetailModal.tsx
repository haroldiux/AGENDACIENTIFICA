'use client';

import {
  CalendarDays,
  Globe,
  GraduationCap,
  User,
  Tag,
  FlaskConical,
  Paperclip,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { MergedCalendarItem } from '@/lib/api';

interface CalendarEventDetailModalProps {
  event: MergedCalendarItem | null;
  onClose: () => void;
  onOpenStatusModal?: (event: MergedCalendarItem, initialStatus?: string) => void;
  onStatusChange?: (id: number, newStatus: string) => Promise<void>;
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programada',
  in_progress: 'En progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

function formatDateRange(startDate: string, endDate: string, startTime?: string | null, endTime?: string | null): string {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  let dateStr = '';
  if (startDate === endDate) {
    dateStr = start.toLocaleDateString('es-ES', options);
  } else {
    dateStr = `${start.toLocaleDateString('es-ES', options)} – ${end.toLocaleDateString('es-ES', options)}`;
  }
  if (startTime) {
    const timeStr = endTime ? `${startTime.slice(0, 5)} a ${endTime.slice(0, 5)}` : `${startTime.slice(0, 5)} hs`;
    return `${dateStr} (${timeStr})`;
  }
  return dateStr;
}

export default function CalendarEventDetailModal({
  event,
  onClose,
  onOpenStatusModal,
  onStatusChange,
}: CalendarEventDetailModalProps) {
  if (!event) return null;

  return (
    <Dialog open={!!event} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2 pr-6">
            {event.source_type === 'academic' ? (
              <BookOpen className="w-5 h-5 text-primary shrink-0" />
            ) : (
              <FlaskConical className="w-5 h-5 text-accent shrink-0" />
            )}
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground shrink-0">
              {event.source_type === 'academic' ? 'Académica' : 'Científica'}
            </span>
            <Badge
              variant={event.scope === 'global' || event.career_id === null ? 'default' : 'outline'}
              className={`ml-auto text-xs truncate max-w-[200px] ${
                event.scope === 'global' || event.career_id === null
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-muted text-foreground border-border'
              }`}
            >
              {event.scope === 'global' || event.career_id === null
                ? 'Global / Vicerrectorado'
                : event.career_name
                ? `Carrera: ${event.career_name}`
                : 'Carrera'}
            </Badge>
          </div>
          <DialogTitle className="text-lg font-semibold">{event.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 text-sm text-foreground/90">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>{formatDateRange(event.start_date, event.end_date, event.start_time, event.end_time)}</span>
          </div>

          {event.scope === 'global' || event.career_id === null ? (
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span className="font-medium text-purple-700 dark:text-purple-300">Alcance Global / Vicerrectorado</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <GraduationCap className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>Carrera: {event.career_name || 'Específica'}</span>
            </div>
          )}

          {event.responsible_name && (
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>{event.responsible_name}</span>
            </div>
          )}

          {event.category && (
            <div className="flex items-center gap-3">
              <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="capitalize">{event.category}</span>
            </div>
          )}

          {event.notes && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border text-xs">
              <MessageSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Observaciones / Notas
                </p>
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">{event.notes}</p>
              </div>
            </div>
          )}

          {event.activity_type && (
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                <FlaskConical className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="capitalize font-medium">{event.activity_type.replace('_', ' ')}</span>
              </div>

              {event.status && onStatusChange && (
                <div className="flex items-center gap-2">
                  <Select
                    value={event.status || undefined}
                    onValueChange={(val) => {
                      if (val) {
                        if (val === 'completed' || val === 'cancelled') {
                          onOpenStatusModal?.(event, val);
                        } else {
                          onStatusChange(event.id, val);
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs min-w-[130px]">
                      <span className="font-semibold text-foreground">
                        {STATUS_LABELS[event.status] ?? event.status}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Programada</SelectItem>
                      <SelectItem value="in_progress">En progreso</SelectItem>
                      <SelectItem value="completed">Completada</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>

                  {onOpenStatusModal && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary hover:bg-primary/10"
                      title="Adjuntar evidencia u observaciones"
                      onClick={() => onOpenStatusModal(event)}
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-between items-center">
          {event.source_type === 'scientific' && onOpenStatusModal && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
              onClick={() => onOpenStatusModal(event)}
            >
              <Paperclip className="w-3.5 h-3.5" />
              Subir Evidencia / Observaciones
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose} className="ml-auto">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
