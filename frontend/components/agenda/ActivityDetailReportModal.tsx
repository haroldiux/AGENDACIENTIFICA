"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calendar,
  Clock,
  User,
  Building2,
  Users,
  History,
  MessageSquare,
  Paperclip,
  Printer,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  Globe,
} from "lucide-react";
import {
  api,
  type Career,
  type ScientificActivity,
  type ScientificActivityEvidence,
} from "@/lib/api";
import {
  activityStatusClasses,
  activityStatusLabels,
  activityTypeLabels,
  formatDateRange,
} from "@/components/agenda/agenda-helpers";

interface ActivityDetailReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ScientificActivity | null;
  careers: Career[];
}

export default function ActivityDetailReportModal({
  isOpen,
  onClose,
  activity,
  careers,
}: ActivityDetailReportModalProps) {
  const [evidences, setEvidences] = useState<ScientificActivityEvidence[]>([]);
  const [isLoadingEvidences, setIsLoadingEvidences] = useState(false);

  useEffect(() => {
    if (activity && isOpen) {
      setIsLoadingEvidences(true);
      api.scientific
        .listEvidences(activity.id)
        .then((data) => setEvidences(data))
        .catch(() => setEvidences([]))
        .finally(() => setIsLoadingEvidences(false));
    }
  }, [activity, isOpen]);

  if (!activity) return null;

  const careerName = (id?: number | null) =>
    id ? (careers.find((c) => c.id === id)?.name ?? `Carrera #${id}`) : "Global / Vicerrectorado";

  const collaborationNames = (activity.collaboration_career_ids ?? [])
    .map((cid) => careers.find((c) => c.id === cid)?.name)
    .filter(Boolean);

  const formatTimestamp = (ts?: string | null) => {
    if (!ts) return "No registrado";
    try {
      const d = new Date(ts);
      return d.toLocaleString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return ts;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto print:max-w-none print:w-full print:max-h-none print:shadow-none print:border-none">
        {/* Printable Section Wrapper */}
        <div className="space-y-6 print:p-0">
          <DialogHeader className="border-b border-border pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  Actividad Científica
                </Badge>
                {activity.career_id === null ? (
                  <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20 gap-1">
                    <Globe className="w-3 h-3" /> Global / Vicerrectorado
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 gap-1">
                    <Building2 className="w-3 h-3" /> {careerName(activity.career_id)}
                  </Badge>
                )}
              </div>
              <Badge
                variant="secondary"
                className={`text-xs px-3 py-1 font-semibold ${activityStatusClasses[activity.status] ?? ""}`}
              >
                {activityStatusLabels[activity.status] ?? activity.status}
              </Badge>
            </div>

            <DialogTitle className="text-xl font-bold text-foreground">
              {activity.title}
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Ficha e Informe Individual de la Actividad · ID #{activity.id}
            </p>
          </DialogHeader>

          {/* Main Info Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-muted/30 border border-border p-3.5 rounded-xl space-y-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-primary" /> Fechas y Horario
              </span>
              <p className="font-semibold text-foreground text-sm">
                {formatDateRange(activity.start_date, activity.end_date, activity.start_time, activity.end_time)}
              </p>
              {activity.start_time && (
                <p className="text-muted-foreground flex items-center gap-1 pt-0.5">
                  <Clock className="w-3 h-3 text-emerald-400" /> Horario: {activity.start_time} - {activity.end_time || "Fin no especificado"}
                </p>
              )}
            </div>

            <div className="bg-muted/30 border border-border p-3.5 rounded-xl space-y-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5 text-[11px]">
                <BookOpen className="w-3.5 h-3.5 text-primary" /> Tipo / Formato
              </span>
              <p className="font-semibold text-foreground text-sm">
                {activityTypeLabels[activity.activity_type] ?? activity.activity_type}
              </p>
            </div>

            <div className="bg-muted/30 border border-border p-3.5 rounded-xl space-y-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5 text-[11px]">
                <User className="w-3.5 h-3.5 text-primary" /> Responsable Asignado
              </span>
              <p className="font-semibold text-foreground text-sm">
                {activity.responsible_name || "Sin responsable asignado"}
              </p>
            </div>

            <div className="bg-muted/30 border border-border p-3.5 rounded-xl space-y-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5 text-[11px]">
                <Building2 className="w-3.5 h-3.5 text-primary" /> Carrera Principal
              </span>
              <p className="font-semibold text-foreground text-sm">
                {careerName(activity.career_id)}
              </p>
            </div>
          </div>

          {/* Collaborating Careers */}
          {collaborationNames.length > 0 && (
            <div className="bg-muted/20 border border-border p-3.5 rounded-xl space-y-1.5 text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5 text-[11px]">
                <Users className="w-3.5 h-3.5 text-primary" /> Carreras en Colaboración
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {collaborationNames.map((name) => (
                  <Badge key={name} variant="outline" className="bg-background text-foreground text-xs font-medium">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Observations & Notes Section */}
          <div className="bg-muted/30 border border-border p-4 rounded-xl space-y-2 text-xs">
            <span className="text-muted-foreground font-semibold flex items-center gap-1.5 text-xs">
              <MessageSquare className="w-4 h-4 text-primary" /> Observaciones y Motivo de Cambio de Estado
            </span>
            {activity.notes ? (
              <p className="text-foreground bg-background p-3 rounded-lg border border-border whitespace-pre-wrap leading-relaxed text-xs">
                {activity.notes}
              </p>
            ) : (
              <p className="text-muted-foreground italic text-xs">
                Sin observaciones o notas registradas para esta actividad.
              </p>
            )}
          </div>

          {/* Evidences & Support Files */}
          <div className="bg-muted/30 border border-border p-4 rounded-xl space-y-3 text-xs">
            <span className="text-muted-foreground font-semibold flex items-center gap-1.5 text-xs">
              <Paperclip className="w-4 h-4 text-primary" /> Evidencias y Archivos Adjuntos ({evidences.length})
            </span>

            {isLoadingEvidences ? (
              <p className="text-muted-foreground italic text-xs">Cargando lista de evidencias...</p>
            ) : evidences.length === 0 ? (
              <p className="text-muted-foreground italic text-xs">
                Esta actividad no cuenta con evidencias digitales adjuntas.
              </p>
            ) : (
              <div className="space-y-2">
                {evidences.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex flex-wrap items-center justify-between gap-2 bg-background p-2.5 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <div className="truncate">
                        <p className="font-medium text-foreground text-xs truncate">{ev.filename}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {(ev.file_size / 1024).toFixed(1)} KB · Subido el {formatTimestamp(ev.uploaded_at)}
                        </p>
                      </div>
                    </div>
                    {/* Link to view/download file */}
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}${ev.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                    >
                      <Download className="w-3 h-3" /> Descargar
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Traceability & Modification Logs */}
          <div className="bg-muted/20 border border-border p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-primary" />
              <span>Fecha de creación: <strong>{formatTimestamp(activity.created_at)}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Última modificación: <strong>{formatTimestamp(activity.updated_at || activity.created_at)}</strong></span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex justify-end gap-3 pt-3 border-t border-border print:hidden">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir Ficha PDF
            </Button>
            <Button type="button" size="sm" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
