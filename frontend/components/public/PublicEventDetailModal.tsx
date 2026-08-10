"use client";

import React from "react";
import { PublicEventDetail, api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Building2,
  BookOpen,
  FlaskConical,
  FileText,
  Download,
  FileCheck,
  Info,
  Tag,
} from "lucide-react";

interface PublicEventDetailModalProps {
  event: PublicEventDetail | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

export default function PublicEventDetailModal({
  event,
  isOpen,
  onClose,
  isLoading = false,
}: PublicEventDetailModalProps) {
  if (!isOpen) return null;

  const isAcademic = event?.source_type === "academic";

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader className="space-y-3">
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 mt-2">Cargando información del evento...</p>
            </div>
          ) : !event ? (
            <div className="py-6 text-center text-slate-500">No se encontraron detalles del evento</div>
          ) : (
            <>
              {/* Header Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  className={
                    isAcademic
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-100"
                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100"
                  }
                >
                  {isAcademic ? (
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      Actividad Académica
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <FlaskConical className="w-3.5 h-3.5" />
                      Actividad Científica
                    </span>
                  )}
                </Badge>

                {event.status && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {event.status === "scheduled"
                      ? "Programada"
                      : event.status === "in_progress"
                      ? "En progreso"
                      : event.status === "completed"
                      ? "Completada"
                      : event.status}
                  </Badge>
                )}

                {event.activity_type && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    {event.activity_type}
                  </Badge>
                )}
              </div>

              {/* Event Title */}
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                {event.title}
              </DialogTitle>

              <DialogDescription className="text-xs text-slate-500">
                Detalles públicos del evento institucional UNITEPC
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        {event && !isLoading && (
          <div className="space-y-6 mt-4">
            {/* Meta Attributes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-sm">
              {/* Date */}
              <div className="flex items-start gap-3">
                <CalendarIcon className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-xs font-semibold text-slate-500">Fecha</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    {event.start_date}
                    {event.end_date !== event.start_date && ` al ${event.end_date}`}
                  </span>
                </div>
              </div>

              {/* Time */}
              {event.start_time && (
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-xs font-semibold text-slate-500">Horario</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {event.start_time}
                      {event.end_time && ` - ${event.end_time}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Responsible Name */}
              {event.responsible_name && (
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-xs font-semibold text-slate-500">Responsable / Ponente</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {event.responsible_name}
                    </span>
                  </div>
                </div>
              )}

              {/* Career */}
              {event.career && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-xs font-semibold text-slate-500">Carrera / Facultad</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {event.career.name}
                      {event.career.faculty && ` (${event.career.faculty})`}
                    </span>
                  </div>
                </div>
              )}

              {/* Category */}
              {(event.category || event.activity_category) && (
                <div className="flex items-start gap-3">
                  <Tag className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-xs font-semibold text-slate-500">Categoría</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {event.activity_category?.name || event.category}
                    </span>
                  </div>
                </div>
              )}

              {/* Gestion */}
              {event.gestion && (
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-xs font-semibold text-slate-500">Gestión Académica</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {event.gestion.name}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Notes / Description */}
            {event.notes && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Descripción o Notas del Evento
                </h4>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line border border-slate-100 dark:border-slate-800">
                  {event.notes}
                </div>
              </div>
            )}

            {/* Evidences Download Section */}
            {event.evidences && event.evidences.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-500" />
                  Evidencias y Documentos Adjuntos ({event.evidences.length})
                </h4>
                <div className="space-y-2">
                  {event.evidences.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {ev.filename}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {formatFileSize(ev.file_size)} • {new Date(ev.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <a
                        href={api.publicPortal.getEvidenceDownloadUrl(ev.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <Button size="sm" variant="outline" className="text-xs gap-1.5 hover:bg-emerald-50 hover:text-emerald-700">
                          <Download className="w-3.5 h-3.5" />
                          <span>Descargar</span>
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer close button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button onClick={onClose} variant="secondary" className="text-xs px-5">
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
