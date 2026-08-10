"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
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
  Activity,
  PlusCircle,
  Pencil,
  GraduationCap,
  ShieldCheck,
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
      {/* Strict CSS for 1 Single Page Printing + Clean Header */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
          html, body {
            height: 100vh !important;
            max-height: 100vh !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: #ffffff !important;
            color: #0f172a !important;
          }
          /* Hide everything in body EXCEPT Radix Portal */
          body > *:not([data-radix-portal]) {
            display: none !important;
          }
          /* Hide Radix Close 'X' button and non-export elements */
          button[aria-label="Close"],
          .print-no-export {
            display: none !important;
          }
          /* Remove dark backdrop background */
          [data-radix-portal] > div {
            background: transparent !important;
            backdrop-filter: none !important;
          }
          /* Force Dialog container to occupy exact single A4 page */
          div[role="dialog"] {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            margin: 0 !important;
            padding: 10mm 12mm !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            overflow: hidden !important;
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

      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto print:max-h-none p-0 overflow-hidden border-border shadow-2xl">
        <div className="p-6 space-y-4 text-xs">
          {/* OFFICIAL INSTITUTIONAL UNITEPC PRINT HEADER */}
          <div className="border border-primary/30 bg-primary/5 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-3 border-b border-primary/20 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-md shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-extrabold text-sm tracking-tight text-foreground uppercase leading-none">
                    UNIVERSIDAD TÉCNICA PRIVADA COSMOPOLITA
                  </p>
                  <p className="text-[11px] font-semibold text-primary tracking-wide leading-tight mt-0.5">
                    UNITEPC · VICERRECTORADO ACADÉMICO Y DE INVESTIGACIÓN
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <Badge variant="outline" className="bg-background text-foreground border-primary/30 text-[10px] font-mono font-bold">
                  REGISTRO #ACT-{activity.id}
                </Badge>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  Ficha Técnica de Actividad
                </p>
              </div>
            </div>

            {/* Activity Title & Main Status Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div>
                <h2 className="text-lg font-extrabold text-foreground leading-tight">
                  {activity.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[11px] font-semibold">
                    Actividad Científica
                  </Badge>
                  {activity.career_id === null ? (
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[11px] gap-1 font-semibold">
                      <Globe className="w-3 h-3" /> Global / Vicerrectorado
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[11px] gap-1 font-semibold">
                      <Building2 className="w-3 h-3" /> {careerName(activity.career_id)}
                    </Badge>
                  )}
                </div>
              </div>

              <Badge
                variant="secondary"
                className={`text-xs px-3 py-1 font-bold whitespace-nowrap ${activityStatusClasses[activity.status] ?? ""}`}
              >
                {activityStatusLabels[activity.status] ?? activity.status}
              </Badge>
            </div>
          </div>

          {/* Main Info Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-muted/30 border border-border p-3 rounded-xl space-y-1 printable-card">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5 text-[11px] printable-text-muted">
                <Calendar className="w-3.5 h-3.5 text-primary" /> Fechas y Horario
              </span>
              <p className="font-semibold text-foreground text-xs">
                {formatDateRange(activity.start_date, activity.end_date)}
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
              <p className="font-semibold text-foreground text-xs">
                {activityTypeLabels[activity.activity_type] ?? activity.activity_type}
              </p>
            </div>

            <div className="bg-muted/30 border border-border p-3 rounded-xl space-y-1 printable-card">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5 text-[11px] printable-text-muted">
                <User className="w-3.5 h-3.5 text-primary" /> Responsable Asignado
              </span>
              <p className="font-semibold text-foreground text-xs">
                {activity.responsible_name || "Sin responsable asignado"}
              </p>
            </div>

            <div className="bg-muted/30 border border-border p-3 rounded-xl space-y-1 printable-card">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5 text-[11px] printable-text-muted">
                <Building2 className="w-3.5 h-3.5 text-primary" /> Carrera Principal
              </span>
              <p className="font-semibold text-foreground text-xs">
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

          {/* Observations & Motive */}
          <div className="bg-muted/30 border border-border p-3 rounded-xl space-y-1.5 text-xs printable-card">
            <span className="text-muted-foreground font-semibold flex items-center gap-1.5 text-xs printable-text-muted">
              <MessageSquare className="w-3.5 h-3.5 text-primary" /> Observaciones y Motivo de Estado
            </span>
            {activity.notes ? (
              <p className="text-foreground bg-background p-2 rounded-lg border border-border whitespace-pre-wrap leading-relaxed text-xs">
                {activity.notes}
              </p>
            ) : (
              <p className="text-muted-foreground italic text-xs printable-text-muted">
                Sin observaciones o notas registradas para esta actividad.
              </p>
            )}
          </div>

          {/* Evidences */}
          <div className="bg-muted/30 border border-border p-3 rounded-xl space-y-1.5 text-xs printable-card">
            <span className="text-muted-foreground font-semibold flex items-center gap-1.5 text-xs printable-text-muted">
              <Paperclip className="w-3.5 h-3.5 text-primary" /> Evidencias y Archivos Adjuntos ({evidences.length})
            </span>

            {isLoading ? (
              <p className="text-muted-foreground italic text-xs printable-text-muted">Cargando lista de evidencias...</p>
            ) : evidences.length === 0 ? (
              <p className="text-muted-foreground italic text-xs printable-text-muted">
                Esta actividad no cuenta con evidencias digitales adjuntas.
              </p>
            ) : (
              <div className="space-y-1">
                {evidences.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex flex-wrap items-center justify-between gap-2 bg-background p-1.5 px-2.5 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
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
                      className="print-no-export inline-flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary px-2 py-0.5 rounded text-[11px] font-medium transition-colors"
                    >
                      <Download className="w-3 h-3" /> Descargar
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AUDIT LOG TIMELINE */}
          <div className="bg-muted/30 border border-border p-3 rounded-xl space-y-1.5 text-xs printable-card">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-semibold flex items-center gap-1.5 text-xs printable-text-muted">
                <History className="w-3.5 h-3.5 text-primary" /> Historial Completo de Trazabilidad y Auditoría ({audits.length})
              </span>
            </div>

            {isLoading ? (
              <p className="text-muted-foreground italic text-xs printable-text-muted">Cargando historial de cambios...</p>
            ) : audits.length === 0 ? (
              <div className="text-muted-foreground text-xs space-y-0.5 printable-text-muted">
                <p>• Creación: <strong>{formatTimestamp(activity.created_at || activity.start_date)}</strong></p>
              </div>
            ) : (
              <div className="space-y-1.5 pt-0.5">
                {audits.map((aud) => {
                  const actorName = aud.user
                    ? `${aud.user.full_name || aud.user.username} (${aud.user.role})`
                    : "Sistema / Registro Inicial";

                  return (
                    <div
                      key={aud.id}
                      className="flex items-start gap-2 bg-background p-2 rounded-lg border border-border text-[11px]"
                    >
                      {ACTION_ICONS[aud.action] || <History className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1 py-0 font-bold ${ACTION_BADGES[aud.action] || ""}`}
                            >
                              {aud.action.replace("_", " ")}
                            </Badge>
                            <span className="text-[11px] font-medium text-foreground flex items-center gap-1">
                              <User className="w-3 h-3 text-primary shrink-0" />
                              {actorName}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground printable-text-muted font-medium">
                            {formatTimestamp(aud.timestamp)}
                          </span>
                        </div>
                        <p className="text-foreground text-[11px] font-normal leading-tight">
                          {aud.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Printable Action Footer */}
          <div className="flex justify-end gap-3 pt-2 border-t border-border print-no-export">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 text-xs font-semibold"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir Ficha (1 Hoja)
            </Button>
            <Button type="button" size="sm" onClick={onClose} className="text-xs">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
