'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Upload, Trash2, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, type Career } from '@/lib/api';
import { config as appConfig } from '@/lib/config';

interface CalendarCoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  careers: Career[];
  selectedCareerId?: number | null;
}

export default function CalendarCoverModal({
  isOpen,
  onClose,
  careers,
  selectedCareerId = null,
}: CalendarCoverModalProps) {
  const [targetScope, setTargetScope] = useState<'global' | 'career'>('global');
  const [careerId, setCareerId] = useState<number | null>(selectedCareerId);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasCustom, setHasCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync initial scope from prop
  useEffect(() => {
    if (selectedCareerId) {
      setTargetScope('career');
      setCareerId(selectedCareerId);
    } else {
      setTargetScope('global');
      setCareerId(null);
    }
  }, [selectedCareerId, isOpen]);

  // Load existing cover status
  useEffect(() => {
    if (!isOpen) return;
    const cid = targetScope === 'career' ? careerId : null;
    setIsLoading(true);
    setSelectedFile(null);

    api.reports
      .getCover(cid)
      .then((res) => {
        setHasCustom(res.has_custom);
        if (res.has_custom && res.url) {
          const baseUrl = appConfig.apiUrl.replace(/\/api\/v1\/?$/, '');
          setPreviewUrl(`${baseUrl}${res.url}?t=${Date.now()}`);
        } else {
          setPreviewUrl(null);
        }
      })
      .catch(() => {
        setHasCustom(false);
        setPreviewUrl(null);
      })
      .finally(() => setIsLoading(false));
  }, [isOpen, targetScope, careerId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5 MB');
      return;
    }
    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecciona una imagen primero');
      return;
    }
    const cid = targetScope === 'career' ? careerId : null;
    setIsSaving(true);
    try {
      await api.reports.uploadCover(selectedFile, cid);
      toast.success('Portada del calendario actualizada correctamente');
      setHasCustom(true);
      setSelectedFile(null);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir la portada');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    const cid = targetScope === 'career' ? careerId : null;
    setIsSaving(true);
    try {
      await api.reports.deleteCover(cid);
      toast.success('Portada restablecida al diseño institucional predeterminado');
      setHasCustom(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch {
      toast.error('Error al restablecer la portada');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-surface border-border text-foreground">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <ImageIcon className="w-5 h-5 text-primary" />
            Personalizar Portada del Calendario (PDF)
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Sube la imagen oficial que aparecerá en el recuadro superior derecho de los reportes PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Scope Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Ámbito de la Portada
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetScope('global')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  targetScope === 'global'
                    ? 'bg-primary/15 border-primary text-primary shadow-sm'
                    : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                Global / Institucional
              </button>
              <button
                type="button"
                onClick={() => setTargetScope('career')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  targetScope === 'career'
                    ? 'bg-primary/15 border-primary text-primary shadow-sm'
                    : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                Por Carrera Específica
              </button>
            </div>
          </div>

          {/* Career dropdown if career scope */}
          {targetScope === 'career' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Seleccionar Carrera
              </label>
              <select
                value={careerId ?? ''}
                onChange={(e) => setCareerId(e.target.value ? Number(e.target.value) : null)}
                className="w-full bg-background border border-input rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
              >
                <option value="">Seleccione una carrera...</option>
                {careers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Image Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Vista Previa de la Portada
              </label>
              {hasCustom && (
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Imagen Personalizada Activa
                </span>
              )}
            </div>

            <div className="relative w-full h-36 rounded-xl border border-dashed border-border bg-muted/20 overflow-hidden flex items-center justify-center">
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cargando portada...</span>
                </div>
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Portada calendario"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-muted-foreground p-4 text-center">
                  <Sparkles className="w-6 h-6 text-primary/60" />
                  <p className="font-semibold text-xs text-foreground">Imagen Institucional por Defecto</p>
                  <p className="text-[11px]">Se usará la fotografía estándar de UNITEPC</p>
                </div>
              )}
            </div>
          </div>

          {/* File input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Subir Nueva Fotografía (JPG, PNG o WebP, Máx 5 MB)
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              className="w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
            {selectedFile && (
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" /> Archivo seleccionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
          {hasCustom ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={handleReset}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Restablecer
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
              Cerrar
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!selectedFile || isSaving}
              onClick={handleUpload}
              className="gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  Guardar Portada
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
