"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Upload,
  MessageSquare,
  Loader2,
  CheckCircle2,
  Trash2,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  api,
  type ScientificActivityEvidence,
  type ScientificActivityStatus,
} from "@/lib/api";

const STATUS_LABELS: Record<ScientificActivityStatus, string> = {
  scheduled: "Programada",
  in_progress: "En progreso",
  completed: "Completada",
  cancelled: "Cancelada",
};

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  activity: {
    id: number;
    title: string;
    status: ScientificActivityStatus;
    notes?: string | null;
    career_name?: string | null;
  } | null;
}

export default function StatusUpdateModal({
  isOpen,
  onClose,
  onSuccess,
  activity,
}: StatusUpdateModalProps) {
  const [targetStatus, setTargetStatus] = useState<ScientificActivityStatus>("scheduled");
  const [notesText, setNotesText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingEvidences, setExistingEvidences] = useState<ScientificActivityEvidence[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingEvidenceId, setIsDeletingEvidenceId] = useState<number | null>(null);

  useEffect(() => {
    if (activity && isOpen) {
      setTargetStatus(activity.status || "scheduled");
      setNotesText(activity.notes || "");
      setSelectedFile(null);

      // Load existing uploaded evidences
      api.scientific
        .listEvidences(activity.id)
        .then((evs) => setExistingEvidences(evs))
        .catch(() => setExistingEvidences([]));
    }
  }, [activity, isOpen]);

  if (!activity) return null;

  const handleDeleteEvidence = async (evidenceId: number) => {
    setIsDeletingEvidenceId(evidenceId);
    try {
      await api.scientific.deleteEvidence(evidenceId);
      setExistingEvidences((prev) => prev.filter((ev) => ev.id !== evidenceId));
      toast.success("Evidencia eliminada");
    } catch {
      toast.error("Error al eliminar la evidencia");
    } finally {
      setIsDeletingEvidenceId(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Update status and notes
      await api.scientific.updateStatus(
        activity.id,
        targetStatus,
        undefined,
        notesText
      );

      // 2. Upload evidence file if selected
      if (selectedFile) {
        await api.scientific.uploadEvidence(activity.id, selectedFile);
      }

      toast.success("Estado y observaciones guardados correctamente");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al actualizar la actividad"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Activity className="w-5 h-5 text-primary" />
            Gestión de Estado, Observaciones y Evidencia
          </DialogTitle>
          <p className="text-xs text-muted-foreground truncate">
            {activity.title} {activity.career_name ? `(${activity.career_name})` : ""}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-3 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground block">
              Nuevo Estado de la Actividad:
            </label>
            <Select
              value={targetStatus}
              onValueChange={(val) => setTargetStatus(val as ScientificActivityStatus)}
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Seleccionar estado">
                  {STATUS_LABELS[targetStatus]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Programada</SelectItem>
                <SelectItem value="in_progress">En progreso</SelectItem>
                <SelectItem value="completed">Completada (Requiere verificación)</SelectItem>
                <SelectItem value="cancelled">Cancelada (Motivo u observación)</SelectItem>
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
                targetStatus === "cancelled"
                  ? "Indique el motivo de la cancelación de la actividad..."
                  : targetStatus === "completed"
                  ? "Indique comentarios sobre los resultados de la actividad..."
                  : "Escriba observaciones generales sobre la actividad..."
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
              <span className="font-semibold text-foreground block">
                Evidencias Adjuntas Previamente ({existingEvidences.length}):
              </span>
              <div className="max-h-28 overflow-y-auto space-y-1 bg-muted/30 p-2 rounded-lg border border-border">
                {existingEvidences.map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="truncate flex items-center gap-1.5 font-medium">
                      <FileText className="w-3 h-3 text-primary shrink-0" />
                      {ev.filename}
                    </span>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] text-muted-foreground">
                        {(ev.file_size / 1024).toFixed(0)} KB
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvidence(ev.id)}
                        disabled={isDeletingEvidenceId === ev.id}
                        className="text-rose-400 hover:text-rose-300 p-0.5 rounded transition-colors"
                        title="Eliminar evidencia"
                      >
                        {isDeletingEvidenceId === ev.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </button>
                    </div>
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
            disabled={isSaving}
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isSaving}
            onClick={handleSave}
            className="gap-1.5"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
