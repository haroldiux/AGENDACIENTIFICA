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
import { type MergedCalendarItem } from '@/lib/api';
import { getEventColor } from './CalendarLegend';
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
        className={`w-2 h-2 rounded-full shrink-0 shadow-sm ${
          item.scope === 'global' || item.career_id === null
            ? 'bg-purple-300 ring-1 ring-purple-400'
            : item.source_type === 'scientific'
            ? 'bg-pink-300 ring-1 ring-white/60'
            : 'bg-emerald-300'
        }`}
      />
      <span className="truncate font-semibold tracking-tight">{event.title}</span>
    </div>
  );
};

const eventPropGetter: EventPropGetter<CalendarEvent> = (event) => {
  const item = event.resource;
  const color = getEventColor(item);

  return {
    style: {
      backgroundColor: color,
      color: '#ffffff',
      borderRadius: '6px',
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

export default function CalendarView({ items, isLoading, onStatusChange }: CalendarViewProps) {
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

  if (isLoading) {
    return (
      <Card className="rounded-xl p-8 min-h-[500px] flex items-center justify-center border-border shadow-sm">
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
