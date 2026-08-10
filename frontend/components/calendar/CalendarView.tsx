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
import { api, type MergedCalendarItem, type ScientificActivityStatus } from '@/lib/api';
import { getEventColor } from './CalendarLegend';
import {
  X,
  BookOpen,
  FlaskConical,
  CalendarDays,
  User,
  Tag,
  AlertCircle,
  Globe,
  GraduationCap,
  Paperclip,
  Upload,
  FileText,
  CheckCircle2,
  MessageSquare,
  Loader2,
  FileUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import toast from 'react-hot-toast';

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

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programada',
  in_progress: 'En progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
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

export default function CalendarView({ items, isLoading, onStatusChange }: CalendarViewProps) {
  const [view, setView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<MergedCalendarItem | null>(null);

  const [statusModalEvent, setStatusModalEvent] = useState<MergedCalendarItem | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>('scheduled');
  const [notesText, setNotesText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingEvidences, setExistingEvidences] = useState<any[]>([]);
  const [isSavingStatus, setIsSavingStatus] = useState(false);

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

  const openStatusModal = async (event: MergedCalendarItem, initialStatus?: string) => {
    setStatusModalEvent(event);
    setTargetStatus(initialStatus || event.status || 'scheduled');
    setNotesText('');
    setSelectedFile(null);
    setExistingEvidences([]);

    try {
      if (event.source_type === 'scientific') {
        const list = await api.scientific.listEvidences(event.id);
        setExistingEvidences(list || []);
      }
    } catch (err) {
      console.error('Error fetching evidences:', err);
    }
  };

  const handleSaveStatusModal = async () => {
    if (!statusModalEvent) return;
    setIsSavingStatus(true);
    try {
      await api.scientific.updateStatus(
        statusModalEvent.id,
        targetStatus as ScientificActivityStatus,
        undefined,
        notesText.trim() ? notesText.trim() : undefined
      );

      if (selectedFile) {
        await api.scientific.uploadEvidence(statusModalEvent.id, selectedFile);
      }

      if (onStatusChange) {
        await onStatusChange(statusModalEvent.id, targetStatus);
      }

      toast.success('Estado, observaciones y evidencia guardados correctamente');
      setStatusModalEvent(null);
      setSelectedEvent(null);
    } catch (err) {
      console.error(err);
      toast.error('Error guardando los cambios de estado');
    } finally {
      setIsSavingStatus(false);
    }
  };

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
                  <span>{formatDateRange(selectedEvent.start_date, selectedEvent.end_date, selectedEvent.start_time, selectedEvent.end_time)}</span>
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
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-3">
                      <FlaskConical className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="capitalize font-medium">{selectedEvent.activity_type.replace('_', ' ')}</span>
                    </div>

                    {selectedEvent.status && onStatusChange && (
                      <div className="flex items-center gap-2">
                        <Select
                          value={selectedEvent.status || undefined}
                          onValueChange={(val) => {
                            if (val) {
                              if (val === 'completed' || val === 'cancelled') {
                                openStatusModal(selectedEvent, val);
                              } else {
                                onStatusChange(selectedEvent.id, val);
                              }
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs min-w-[130px]">
                            <span className="font-semibold text-foreground">
                              {STATUS_LABELS[selectedEvent.status] ?? selectedEvent.status}
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">Programada</SelectItem>
                            <SelectItem value="in_progress">En progreso</SelectItem>
                            <SelectItem value="completed">Completada</SelectItem>
                            <SelectItem value="cancelled">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                          title="Adjuntar evidencia u observaciones"
                          onClick={() => openStatusModal(selectedEvent)}
                        >
                          <Paperclip className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-between items-center">
                {selectedEvent.source_type === 'scientific' && onStatusChange && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                    onClick={() => openStatusModal(selectedEvent)}
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    Subir Evidencia / Observaciones
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setSelectedEvent(null)} className="ml-auto">
                  Cerrar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!statusModalEvent} onOpenChange={(open) => !open && setStatusModalEvent(null)}>
        <DialogContent className="sm:max-w-lg space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <FileUp className="w-5 h-5 text-primary shrink-0" />
              Gestión de Estado, Observaciones y Evidencia
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {statusModalEvent?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground block">Nuevo Estado de la Actividad:</label>
              <Select value={targetStatus} onValueChange={(val) => val && setTargetStatus(val)}>
                <SelectTrigger className="h-9 text-xs w-full">
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Programada</SelectItem>
                  <SelectItem value="in_progress">En progreso</SelectItem>
                  <SelectItem value="completed">Completada (Requiere verificación)</SelectItem>
                  <SelectItem value="cancelled">Cancelada (Motivo obligatorio u observación)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                Cuadro de Observaciones / Motivo:
              </label>
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder={
                  targetStatus === 'cancelled'
                    ? 'Indique el motivo de la cancelación de la actividad...'
                    : targetStatus === 'completed'
                    ? 'Indique comentarios sobre los resultados de la actividad...'
                    : 'Escriba observaciones generales sobre la actividad...'
                }
                rows={3}
                className="w-full p-2.5 bg-background border border-input rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-primary" />
                Adjuntar Evidencia (PDF, Imagen, Word - Máx 10MB):
              </label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.docx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
              {selectedFile && (
                <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Archivo listo para subir: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            {existingEvidences.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-border">
                <span className="font-semibold text-foreground block">Evidencias Adjuntas Previamente ({existingEvidences.length}):</span>
                <div className="max-h-28 overflow-y-auto space-y-1 bg-muted/30 p-2 rounded-lg border border-border">
                  {existingEvidences.map((ev) => (
                    <div key={ev.id} className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="truncate flex items-center gap-1.5 font-medium">
                        <FileText className="w-3 h-3 text-primary shrink-0" />
                        {ev.filename}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {(ev.file_size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSavingStatus}
              onClick={() => setStatusModalEvent(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSavingStatus}
              onClick={handleSaveStatusModal}
              className="gap-1.5"
            >
              {isSavingStatus ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
