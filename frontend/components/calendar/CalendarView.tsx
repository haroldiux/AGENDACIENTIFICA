'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Calendar as BigCalendar,
  momentLocalizer,
  type Event as RBCEvent,
  type View,
  type EventPropGetter,
} from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import type { MergedCalendarItem } from '@/lib/api';
import { getEventColor } from './CalendarLegend';
import { X, BookOpen, FlaskConical, CalendarDays, User, Tag, AlertCircle, Globe, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

moment.locale('es');
const localizer = momentLocalizer(moment);

interface CalendarEvent extends RBCEvent {
  resource: MergedCalendarItem;
}

interface CalendarViewProps {
  items: MergedCalendarItem[];
  isLoading?: boolean;
  onStatusChange?: (id: number, newStatus: string) => Promise<void>;
}

const messages = {
  allDay: 'Todo el día',
  previous: 'Anterior',
  next: 'Siguiente',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'No hay actividades en este rango',
  showMore: (total: number) => `+ ${total} más`,
};

function CalendarEventContent({ event }: { event: CalendarEvent }) {
  const item = event.resource;
  const isGlobal = item.scope === 'global' || item.career_id === null;
  const isScientific = item.source_type === 'scientific';

  return (
    <div className="flex items-center gap-1.5 overflow-hidden truncate px-1 py-0.5 leading-tight">
      <span
        className={`w-2 h-2 rounded-full shrink-0 shadow-sm ${
          isGlobal
            ? 'bg-purple-300 ring-2 ring-purple-400'
            : isScientific
            ? 'bg-pink-300 ring-1 ring-white/60'
            : 'bg-white/90'
        }`}
        title={isGlobal ? 'Global / Vicerrectorado' : isScientific ? 'Actividad Científica' : `Carrera: ${item.career_name || 'Asignada'}`}
      />
      <span className="truncate text-[11px] font-semibold tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
        {item.title}
      </span>
    </div>
  );
}

function mergedItemToEvent(item: MergedCalendarItem): CalendarEvent {
  const start = new Date(`${item.start_date}T12:00:00`);
  const end = new Date(`${item.end_date}T12:00:00`);
  if (item.start_date === item.end_date) {
    end.setHours(23, 59, 0, 0);
  }
  return {
    title: item.title,
    start,
    end,
    resource: item,
  };
}

const eventPropGetter: EventPropGetter<CalendarEvent> = (event) => {
  const item = event.resource;
  const color = getEventColor(item);
  const isGlobal = item.scope === 'global' || item.career_id === null;

  return {
    style: {
      backgroundColor: color,
      color: '#ffffff',
      borderLeft: isGlobal ? '4px solid #a855f7' : undefined,
      borderRadius: '5px',
      fontSize: '0.75rem',
      fontWeight: 600,
      boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
      padding: '2px 4px',
      margin: '1px 0',
      border: '1px solid rgba(255,255,255,0.15)',
    },
    className: item.source_type === 'academic' ? 'rbc-event-academic' : 'rbc-event-scientific',
  };
};

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  if (startDate === endDate) {
    return start.toLocaleDateString('es-ES', options);
  }
  return `${start.toLocaleDateString('es-ES', options)} – ${end.toLocaleDateString('es-ES', options)}`;
}

export default function CalendarView({ items, isLoading, onStatusChange }: CalendarViewProps) {
  const [view, setView] = useState<View>('month');
  const [selectedEvent, setSelectedEvent] = useState<MergedCalendarItem | null>(null);

  useEffect(() => {
    if (selectedEvent) {
      const freshItem = items.find(
        (i) => i.id === selectedEvent.id && i.source_type === selectedEvent.source_type
      );
      if (freshItem && freshItem.status !== selectedEvent.status) {
        setSelectedEvent(freshItem);
      }
    }
  }, [items, selectedEvent]);

  const events = useMemo(() => items.map(mergedItemToEvent), [items]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event.resource);
  }, []);

  if (isLoading) {
    return (
      <Card className="rounded-xl p-8 min-h-[500px] flex items-center justify-center border-border shadow-sm">
        <div className="animate-pulse text-muted-foreground">Cargando calendario...</div>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-xl p-4 border-border shadow-sm">
        <BigCalendar<CalendarEvent>
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          views={['month', 'week', 'day', 'agenda']}
          messages={messages}
          eventPropGetter={eventPropGetter}
          onSelectEvent={handleSelectEvent}
          components={{
            event: CalendarEventContent,
          }}
          popup
          style={{ height: 650 }}
          culture="es"
        />
      </Card>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2 pr-6">
                  {selectedEvent.source_type === 'academic' ? (
                    <BookOpen className="w-5 h-5 text-primary shrink-0" />
                  ) : (
                    <FlaskConical className="w-5 h-5 text-accent shrink-0" />
                  )}
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground shrink-0">
                    {selectedEvent.source_type === 'academic' ? 'Académica' : 'Científica'}
                  </span>
                  <Badge
                    variant={selectedEvent.scope === 'global' || selectedEvent.career_id === null ? 'default' : 'outline'}
                    className={`ml-auto text-xs truncate max-w-[200px] ${
                      selectedEvent.scope === 'global' || selectedEvent.career_id === null
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {selectedEvent.scope === 'global' || selectedEvent.career_id === null
                      ? 'Global / Vicerrectorado'
                      : selectedEvent.career_name
                      ? `Carrera: ${selectedEvent.career_name}`
                      : 'Carrera'}
                  </Badge>
                </div>
                <DialogTitle className="text-lg font-semibold">{selectedEvent.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4 text-sm text-foreground/90">
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>{formatDateRange(selectedEvent.start_date, selectedEvent.end_date)}</span>
                </div>

                {selectedEvent.scope === 'global' || selectedEvent.career_id === null ? (
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="font-medium text-purple-700 dark:text-purple-300">Alcance Global / Vicerrectorado</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>Carrera: {selectedEvent.career_name || 'Específica'}</span>
                  </div>
                )}

                {selectedEvent.responsible_name && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>{selectedEvent.responsible_name}</span>
                  </div>
                )}

                {selectedEvent.category && (
                  <div className="flex items-center gap-3">
                    <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="capitalize">{selectedEvent.category}</span>
                  </div>
                )}

                {selectedEvent.activity_type && (
                  <div className="flex items-center gap-3">
                    <FlaskConical className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="capitalize">{selectedEvent.activity_type.replace('_', ' ')}</span>
                    {selectedEvent.status && onStatusChange && (
                      <div className="ml-auto">
                        <Select
                          value={selectedEvent.status || undefined}
                          onValueChange={(val) => {
                            if (val) onStatusChange(selectedEvent.id, val);
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs w-[130px]">
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">Programada</SelectItem>
                            <SelectItem value="in_progress">En progreso</SelectItem>
                            <SelectItem value="completed">Completada</SelectItem>
                            <SelectItem value="cancelled">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Cerrar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
