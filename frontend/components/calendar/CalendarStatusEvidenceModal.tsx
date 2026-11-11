'use client';

import { useState, useEffect } from 'react';
import {
  FileUp,
  MessageSquare,
  Upload,
  CheckCircle2,
  FileText,
  Loader2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import toast from 'react-hot-toast';
import {
  api,
  MergedCalendarItem,
  ScientificActivityStatus,
  ScientificActivityEvidence,
} from '@/lib/api';

interface CalendarStatusEvidenceModalProps {
  event: MergedCalendarItem | null;
  initialStatus?: string;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (id: number, newStatus: string) => Promise<void>;
}

export default function CalendarStatusEvidenceModal({
  event,
  initialStatus,
  isOpen,
  onClose,
  onStatusChange,
}: CalendarStatusEvidenceModalProps) {
  const [targetStatus, setTargetStatus] = useState<string>('scheduled');
  const [notesText, setNotesText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingEvidences, setExistingEvidences] = useState<ScientificActivityEvidence[]>([]);
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  useEffect(() => {
    if (event && isOpen) {
      setTargetStatus(initialStatus || event.status || 'scheduled');
      setNotesText('');
      setSelectedFile(null);
      setExistingEvidences([]);

      if (event.source_type === 'scientific') {
        api.scientific
          .listEvidences(event.id)
          .then((list) => setExistingEvidences(list || []))
          .catch((err) => console.error('Error fetching evidences:', err));
      }
    }
  }, [event, initialStatus, isOpen]);

  if (!event) return null;

  const handleSave = async () => {
    setIsSavingStatus(true);
    try {
      await api.scientific.updateStatus(
        event.id,
        targetStatus as ScientificActivityStatus,
        undefined,
        notesText.trim() ? notesText.trim() : undefined
      );

      if (selectedFile) {
        await api.scientific.uploadEvidence(event.id, selectedFile);
      }

      if (onStatusChange) {
        await onStatusChange(event.id, targetStatus);
      }

      toast.success('Estado, observaciones y evidencia guardados correctamente');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Error guardando los cambios de estado');
    } finally {
      setIsSavingStatus(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg space-y-4">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <FileUp className="w-5 h-5 text-primary shrink-0" />
            Gestión de Estado, Observaciones y Evidencia
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {event.title}
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
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
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
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isSavingStatus}
            onClick={handleSave}
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
  );
}
