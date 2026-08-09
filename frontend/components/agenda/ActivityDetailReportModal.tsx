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
  Globe,
  BookOpen,
  ShieldCheck,
  Tag,
  Activity,
  PlusCircle,
  Pencil,
} from "lucide-react";
import {
  api,
  type Career,
  type ScientificActivity,
  type ScientificActivityEvidence,
  type ScientificActivityAudit,
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

const ACTION_ICONS: Record<string, React.ReactNode> = {
  CREACION: <PlusCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />,
  EDICION: <Pencil className="w-3.5 h-3.5 text-amber-500 shrink-0" />,
  CAMBIO_ESTADO: <Activity className="w-3.5 h-3.5 text-emerald-500 shrink-0" />,
  SUBIDA_EVIDENCIA: <Paperclip className="w-3.5 h-3.5 text-purple-500 shrink-0" />,
  ELIMINACION_EVIDENCIA: <Paperclip className="w-3.5 h-3.5 text-rose-500 shrink-0" />,
};

const ACTION_BADGES: Record<string, string> = {
  CREACION: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  EDICION: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  CAMBIO_ESTADO: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  SUBIDA_EVIDENCIA: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  ELIMINACION_EVIDENCIA: "bg-rose-500/10 text-rose-600 border-rose-500/30",
};

export default function ActivityDetailReportModal({
  isOpen,
  onClose,
  activity,
  careers,
}: ActivityDetailReportModalProps) {
  const [evidences, setEvidences] = useState<ScientificActivityEvidence[]>([]);
  const [audits, setAudits] = useState<ScientificActivityAudit[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activity && isOpen) {
      setIsLoading(true);
      Promise.all([
        api.scientific.listEvidences(activity.id),
        api.scientific.listAudits(activity.id),
      ])
        .then(([evs, auds]) => {
          setEvidences(evs);
          setAudits(auds);
        })
        .catch(() => {
          setEvidences([]);
          setAudits([]);
        })
        .finally(() => setIsLoading(false));
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
      {/* Embedded CSS for clean 1-page printing */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            font-family: inherit;
          }
          /* Hide non-modal UI components */
          [role="dialog"] > button[aria-label="Close"],
          .print-no-export {
            display: none !important;
          }
          .printable-modal-sheet {
            background: #ffffff !important;
            color: #0f172a !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          .printable-card {
            border: 1px solid #cbd5e1 !important;
            background-color: #f8fafc !important;
            color: #0f172a !important;
          }
          .printable-text-muted {
            color: #475569 !important;
          }
        }
      `}</style>

      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto printable-modal-sheet">
        <div className="space-y-5 p-1">
          {/* Institutional Print Header */}
          <div className="border-b border-border pb-4">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-primary uppercase block">
                  UNIVERSIDAD TÉCNICA PRIVADA COSMOPOLITA · UNITEPC
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Agenda Científica e Investigativa · Ficha Individual de Actividad
                </span>
              </div>
              <Badge
                variant="secondary"
                className={`text-xs px-3 py-1 font-semibold whitespace-nowrap ${activityStatusClasses[activity.status] ?? ""}`}
              >
                {activityStatusLabels[activity.status] ?? activity.status}
              </Badge>
            </div>

            <DialogTitle className="text-xl font-bold text-foreground mt-1">
              {activity.title}
            </DialogTitle>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                Actividad Científica
              </Badge>
              {activity.career_id === null ? (
                <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs gap-1">
                  <Globe className="w-3.5 h-3.5" /> Global / Vicerrectorado
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs gap-1">
                  <Building2 className="w-3.5 h-3.5" /> {careerName(activity.career_id)}
                </Badge>
              )}
            </div>
          </div>

          {/* Main Activity Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-muted/30 border border-border p-3 rounded-xl space-y-1 printable-card">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5 text-[11px] printable-text-muted">
                <Calendar className="w-3.5 h-3.5 text-primary" /> Fechas y Horario
              </span>
              <p className="font-semibold text-foreground text-sm">
                {formatDateRange(activity.start_date, activity.end_date, activity.start_time, activity.end_time)}
              </p>
              {activity.start_time && (
                <p className="text-muted-foreground flex items-center gap-1 pt-0.5 printable-text-muted">
                  <Clock className="w-3 h-3 text-emerald-400" /> Horario: {activity.start_time} - {activity.end_time || "Fin no especificado"}
                </p>
              )}
            </div>

            <div className="bg-muted/30 border border-border p-3 rounded-xl space-y-1 printable-card">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5 text-[11px] printable-text-muted">
                <BookOpen className="w-3.5 h-3.5 text-primary" /> Tipo / Formato
              </span>
              <p className="font-semibold text-foreground text-sm">
                {activityTypeLabels[activity.activity_type] ?? activity.activity_type}
              </p>
            </div>

            <div className="bg-muted/30 border border-border p-3 rounded-xl space-y-1 printable-card">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5 text-[11px] printable-text-muted">
                <User className="w-3.5 h-3.5 text-primary" /> Responsable Asignado
              </span>
              <p className="font-semibold text-foreground text-sm">
                {activity.responsible_name || "Sin responsable asignado"}
              </p>
            </div>

            <div className="bg-muted/30 border border-border p-3 rounded-xl space-y-1 printable-card">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5 text-[11px] printable-text-muted">
                <Building2 className="w-3.5 h-3.5 text-primary" /> Carrera Principal
              </span>
              <p className="font-semibold text-foreground text-sm">
                {careerName(activity.career_id)}
              </p>
            </div>
          </div>

          {/* Collaborating Careers */}
          {collaborationNames.length > 0 && (
            <div className="bg-muted/20 border border-border p-3 rounded-xl space-y-1.5 text-xs printable-card">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5 text-[11px] printable-text-muted">
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

          {/* Observations & Status Motive */}
          <div className="bg-muted/30 border border-border p-3.5 rounded-xl space-y-1.5 text-xs printable-card">
            <span className="text-muted-foreground font-semibold flex items-center gap-1.5 text-xs printable-text-muted">
              <MessageSquare className="w-4 h-4 text-primary" /> Observaciones y Motivo de Cambio de Estado
            </span>
            {activity.notes ? (
              <p className="text-foreground bg-background p-2.5 rounded-lg border border-border whitespace-pre-wrap leading-relaxed text-xs">
                {activity.notes}
              </p>
            ) : (
              <p className="text-muted-foreground italic text-xs printable-text-muted">
                Sin observaciones o notas registradas para esta actividad.
              </p>
            )}
          </div>

          {/* Uploaded Evidences & Attachments */}
          <div className="bg-muted/30 border border-border p-3.5 rounded-xl space-y-2 text-xs printable-card">
            <span className="text-muted-foreground font-semibold flex items-center gap-1.5 text-xs printable-text-muted">
              <Paperclip className="w-4 h-4 text-primary" /> Evidencias y Archivos Adjuntos ({evidences.length})
            </span>

            {isLoading ? (
              <p className="text-muted-foreground italic text-xs printable-text-muted">Cargando lista de evidencias...</p>
            ) : evidences.length === 0 ? (
              <p className="text-muted-foreground italic text-xs printable-text-muted">
                Esta actividad no cuenta con evidencias digitales adjuntas.
              </p>
            ) : (
              <div className="space-y-1.5">
                {evidences.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex flex-wrap items-center justify-between gap-2 bg-background p-2 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <div className="truncate">
                        <p className="font-medium text-foreground text-xs truncate">{ev.filename}</p>
                        <p className="text-[10px] text-muted-foreground printable-text-muted">
                          {(ev.file_size / 1024).toFixed(1)} KB · Subido el {formatTimestamp(ev.uploaded_at)}
                        </p>
                      </div>
                    </div>
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}${ev.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="print-no-export inline-flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                    >
                      <Download className="w-3 h-3" /> Descargar
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HISTORIAL COMPLETO DE MODIFICACIONES (AUDIT LOG TIMELINE) */}
          <div className="bg-muted/30 border border-border p-3.5 rounded-xl space-y-2 text-xs printable-card">
            <span className="text-muted-foreground font-semibold flex items-center gap-1.5 text-xs printable-text-muted">
              <History className="w-4 h-4 text-primary" /> Historial Completo de Trazabilidad y Modificaciones ({audits.length})
            </span>

            {isLoading ? (
              <p className="text-muted-foreground italic text-xs printable-text-muted">Cargando historial de cambios...</p>
            ) : audits.length === 0 ? (
              <div className="text-muted-foreground text-xs space-y-1 printable-text-muted">
                <p>• Registro de Creación: <strong>{formatTimestamp(activity.created_at || activity.start_date)}</strong></p>
                <p>• Última Actualización: <strong>{formatTimestamp(activity.updated_at || activity.created_at)}</strong></p>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                {audits.map((aud) => (
                  <div
                    key={aud.id}
                    className="flex items-start gap-2.5 bg-background p-2.5 rounded-lg border border-border text-xs"
                  >
                    {ACTION_ICONS[aud.action] || <History className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 font-medium ${ACTION_BADGES[aud.action] || ""}`}
                        >
                          {aud.action.replace("_", " ")}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground printable-text-muted font-medium">
                          {formatTimestamp(aud.timestamp)}
                        </span>
                      </div>
                      <p className="text-foreground text-xs font-normal leading-normal">
                        {aud.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Printable Action Footer */}
          <div className="flex justify-end gap-3 pt-3 border-t border-border print-no-export">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir Ficha PDF (1 Página)
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
