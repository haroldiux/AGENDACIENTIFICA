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
import { useTheme } from 'next-themes';
import { type MergedCalendarItem } from '@/lib/api';
import { getEventPalette } from './CalendarLegend';
import { Card } from '@/components/ui/card';
import CalendarEventDetailModal from './CalendarEventDetailModal';
import CalendarStatusEvidenceModal from './CalendarStatusEvidenceModal';

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
  noEventsInRange: 'No hay actividades en este rango de fechas.',
};

const mergedItemToEvent = (item: MergedCalendarItem): CalendarEvent => {
  let startDate: Date;
  let endDate: Date;
  let isAllDay = true;

  if (item.start_time) {
    const sTime = item.start_time.length === 5 ? `${item.start_time}:00` : item.start_time;
    const eTime = item.end_time ? (item.end_time.length === 5 ? `${item.end_time}:00` : item.end_time) : '23:59:59';
    startDate = new Date(`${item.start_date}T${sTime}`);
    endDate = new Date(`${item.end_date}T${eTime}`);
    isAllDay = false;
  } else {
    startDate = new Date(`${item.start_date}T00:00:00`);
    endDate = new Date(`${item.end_date}T23:59:59`);
    isAllDay = true;
  }

  let displayTitle = item.title;
  if (item.start_time) {
    displayTitle = `[${item.start_time.slice(0, 5)}] ${item.title}`;
  }
  if (item.source_type === 'academic' && item.career_name) {
    displayTitle = `${displayTitle} - ${item.career_name}`;
  }

  return {
    title: displayTitle,
    start: startDate,
    end: endDate,
    allDay: isAllDay,
    resource: item,
  };
};

const CalendarEventContent = ({ event }: { event: CalendarEvent }) => {
  const item = event.resource;
  return (
    <div className="flex items-center gap-1.5 overflow-hidden w-full px-0.5">
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${
          item.scope === 'global' || item.career_id === null
            ? 'bg-purple-500 ring-1 ring-purple-400/50'
            : item.source_type === 'scientific'
            ? 'bg-pink-500 ring-1 ring-pink-400/50'
            : 'bg-emerald-500 ring-1 ring-emerald-400/50'
        }`}
      />
      <span className="truncate font-semibold tracking-tight">{event.title}</span>
    </div>
  );
};

const CalendarAgendaEventContent = ({ event }: { event: CalendarEvent }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const item = event.resource;
  const palette = getEventPalette(item);

  const badgeLabel =
    item.source_type === 'scientific'
      ? (item.activity_type || 'científica').replace('_', ' ')
      : (item.category || 'académica').replace('_', ' ');

  return (
    <div
      style={{
        backgroundColor: isDark ? palette.darkBg : palette.lightBg,
        color: isDark ? palette.darkText : palette.lightText,
        borderColor: isDark ? palette.darkBorder : palette.lightBorder,
        borderLeft: `4px solid ${palette.accent}`,
      }}
      className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg border shadow-sm transition-all hover:opacity-95 cursor-pointer"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            item.scope === 'global' || item.career_id === null
              ? 'bg-purple-500'
              : item.source_type === 'scientific'
              ? 'bg-pink-500'
              : 'bg-emerald-500'
          }`}
        />
        <span className="font-semibold text-xs sm:text-sm truncate">{event.title}</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <span
          style={{
            borderColor: isDark ? palette.darkBorder : palette.lightBorder,
          }}
          className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md border bg-white/60 dark:bg-black/25"
        >
          {badgeLabel}
        </span>
      </div>
    </div>
  );
};

export default function CalendarView({ items, isLoading, onStatusChange }: CalendarViewProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [view, setView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<MergedCalendarItem | null>(null);

  const [statusModalEvent, setStatusModalEvent] = useState<MergedCalendarItem | null>(null);
  const [initialModalStatus, setInitialModalStatus] = useState<string | undefined>();
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

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

  const openStatusModal = (event: MergedCalendarItem, status?: string) => {
    setStatusModalEvent(event);
    setInitialModalStatus(status);
    setIsStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setIsStatusModalOpen(false);
    setStatusModalEvent(null);
    setSelectedEvent(null);
  };

  const events = useMemo(() => items.map(mergedItemToEvent), [items]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event.resource);
  }, []);

  const eventPropGetter: EventPropGetter<CalendarEvent> = useCallback(
    (event) => {
      const item = event.resource;

      // In Agenda view, react-big-calendar applies eventPropGetter.style onto the <tr> row.
      // Return empty row style so table rows remain clean and CalendarAgendaEventContent renders the pastel card.
      if (view === 'agenda') {
        return {
          style: {
            backgroundColor: 'transparent',
            border: 'none',
            boxShadow: 'none',
            padding: 0,
          },
          className: 'rbc-agenda-row-clean',
        };
      }

      const palette = getEventPalette(item);

      return {
        style: {
          backgroundColor: isDark ? palette.darkBg : palette.lightBg,
          color: isDark ? palette.darkText : palette.lightText,
          border: `1px solid ${isDark ? palette.darkBorder : palette.lightBorder}`,
          borderLeft: `3.5px solid ${palette.accent}`,
          borderRadius: '6px',
          fontSize: '0.74rem',
          fontWeight: 600,
          boxShadow: isDark
            ? '0 1px 2px rgba(0, 0, 0, 0.25)'
            : '0 1px 2px rgba(15, 23, 42, 0.06)',
          padding: '2px 5px',
          margin: '1px 0',
        },
        className: item.source_type === 'academic' ? 'rbc-event-academic' : 'rbc-event-scientific',
      };
    },
    [isDark, view]
  );

  if (isLoading) {
    return (
      <Card className="rounded-xl p-8 min-h-[500px] flex items-center justify-center border-border shadow-sm bg-surface">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-sm">Cargando calendario...</span>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-xl p-4 border-border shadow-sm bg-surface">
        <BigCalendar<CalendarEvent>
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          onNavigate={setCurrentDate}
          view={view}
          onView={setView}
          views={['month', 'week', 'day', 'agenda']}
          messages={messages}
          eventPropGetter={eventPropGetter}
          onSelectEvent={handleSelectEvent}
          components={{
            event: CalendarEventContent,
            agenda: {
              event: CalendarAgendaEventContent,
            },
          }}
          popup
          style={{ height: 650 }}
          culture="es"
        />
      </Card>

      <CalendarEventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onOpenStatusModal={openStatusModal}
        onStatusChange={onStatusChange}
      />

      <CalendarStatusEvidenceModal
        event={statusModalEvent}
        initialStatus={initialModalStatus}
        isOpen={isStatusModalOpen}
        onClose={closeStatusModal}
        onStatusChange={onStatusChange}
      />
    </>
  );
}
