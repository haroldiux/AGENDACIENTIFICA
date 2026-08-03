'use client';

import { useState, useMemo, useCallback } from 'react';
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
import { X, BookOpen, FlaskConical, CalendarDays, User, Tag, AlertCircle } from 'lucide-react';

moment.locale('es');
const localizer = momentLocalizer(moment);

// Custom event shape for react-big-calendar
interface CalendarEvent extends RBCEvent {
  resource: MergedCalendarItem;
}

interface CalendarViewProps {
  items: MergedCalendarItem[];
  isLoading?: boolean;
}

// Spanish translations for react-big-calendar
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

function mergedItemToEvent(item: MergedCalendarItem): CalendarEvent {
  const start = new Date(`${item.start_date}T12:00:00`);
  const end = new Date(`${item.end_date}T12:00:00`);
  // Make end date inclusive for single-day events
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
  const isAcademic = item.source_type === 'academic';

  return {
    style: {
      backgroundColor: isAcademic ? color : `${color}20`,
      color: isAcademic ? '#ffffff' : color,
      borderLeft: isAcademic ? undefined : `3px solid ${color}`,
      borderRadius: isAcademic ? '4px' : '4px 0 0 4px',
      fontSize: '0.75rem',
      fontWeight: 500,
      border: isAcademic ? 'none' : `1px solid ${color}40`,
    },
    className: isAcademic ? 'rbc-event-academic' : 'rbc-event-scientific',
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

export default function CalendarView({ items, isLoading }: CalendarViewProps) {
  const [view, setView] = useState<View>('month');
  const [selectedEvent, setSelectedEvent] = useState<MergedCalendarItem | null>(null);

  const events = useMemo(() => items.map(mergedItemToEvent), [items]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event.resource);
  }, []);

  if (isLoading) {
    return (
      <div className="glass-panel rounded-xl p-8 min-h-[500px] flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Cargando calendario...</div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-panel rounded-xl p-4">
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
          popup
          style={{ height: 650 }}
          culture="es"
        />
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="glass-panel rounded-xl max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {selectedEvent.source_type === 'academic' ? (
                  <BookOpen className="w-5 h-5 text-blue-400" />
                ) : (
                  <FlaskConical className="w-5 h-5 text-amber-400" />
                )}
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  {selectedEvent.source_type === 'academic' ? 'Académica' : 'Científica'}
                </span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg font-semibold text-white">{selectedEvent.title}</h3>

            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{formatDateRange(selectedEvent.start_date, selectedEvent.end_date)}</span>
              </div>

              {selectedEvent.responsible_name && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{selectedEvent.responsible_name}</span>
                </div>
              )}

              {selectedEvent.category && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="capitalize">{selectedEvent.category}</span>
                </div>
              )}

              {selectedEvent.activity_type && (
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="capitalize">{selectedEvent.activity_type.replace('_', ' ')}</span>
                  {selectedEvent.status && (
                    <span className="ml-1 px-2 py-0.5 rounded text-xs bg-white/10">
                      {selectedEvent.status === 'scheduled' && 'Programada'}
                      {selectedEvent.status === 'in_progress' && 'En progreso'}
                      {selectedEvent.status === 'completed' && 'Completada'}
                      {selectedEvent.status === 'cancelled' && 'Cancelada'}
                    </span>
                  )}
                </div>
              )}

              {selectedEvent.source_type === 'academic' && selectedEvent.origin_color && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  <span
                    className="inline-block w-4 h-4 rounded"
                    style={{ backgroundColor: selectedEvent.origin_color }}
                  />
                  <span className="text-xs text-slate-500">Color original del calendario académico</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[var(--border)]">
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm text-white transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
