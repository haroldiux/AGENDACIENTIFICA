"use client";

import { useState, useRef, useCallback } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle, AlertTriangle, X, Loader2, Download, CopyX } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { api } from "@/lib/api";
import PageHeader from "@/components/layout/PageHeader";
import { config as appConfig } from "@/lib/config";

interface UploadResult {
  inserted_count: number;
  duplicate_count?: number;
  duplicates?: { row: number; title: string }[];
  errors: { row: number | string; error: string }[];
  conflicts?: {
    activity_title: string;
    conflicting_title: string;
    dates: string;
    career_id: number;
  }[];
}

export default function ImportarPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSetFile(dropped);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) validateAndSetFile(selected);
  }, []);

  function validateAndSetFile(selected: File) {
    if (!selected.name.match(/\.(xlsx|xls)$/i)) {
      toast.error("Solo se permiten archivos Excel (.xlsx, .xls)");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      toast.error("El archivo excede 10 MB");
      return;
    }
    setFile(selected);
    setResult(null);
  }

  async function handleUpload() {
    if (!file) return;
    setIsUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const data = await api.academic.upload(formData);
      setResult(data);

      if (data.inserted_count > 0) {
        toast.success(`${data.inserted_count} actividades importadas correctamente`);
      }
      if (data.errors && data.errors.length > 0) {
        toast.error(`${data.errors.length} filas con errores`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al importar el archivo";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  }

  function clearFile() {
    setFile(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const handleDownloadTemplate = async () => {
    try {
      const blob = await api.importacion.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "plantilla_actividades.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Error al descargar la plantilla");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Toaster position="top-right" />

      {/* Header */}
      <PageHeader
        title="Importar Calendario Académico"
        description="Sube un archivo Excel con las actividades académicas y/o científicas. El sistema las fusionará automáticamente con el calendario existente."
      />

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`
          rounded-2xl p-12 text-center cursor-pointer transition-all
          ${isDragging ? "border-2 border-dashed border-primary bg-primary/10" : "border-2 border-dashed border-border bg-surface shadow-[var(--shadow-glass)] dark:bg-slate-800/20 dark:border-white/10"}
          ${file ? "cursor-default" : "hover:border-primary/50 hover:bg-muted/50 dark:hover:bg-primary/5"}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileSelect}
        />

        {!file ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-foreground font-semibold">Arrastra y suelta tu archivo aquí</p>
              <p className="text-muted-foreground text-sm mt-1">o haz clic para seleccionar</p>
            </div>
            <p className="text-xs text-muted-foreground/75">Formatos aceptados: .xlsx, .xls (máx. 10 MB)</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <div>
              <p className="text-foreground font-semibold">{file.name}</p>
              <p className="text-muted-foreground text-sm">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload();
                }}
                disabled={isUploading}
                className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirmar Importación
                  </>
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                disabled={isUploading}
                className="bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 border border-border"
              >
                <X className="w-4 h-4" />
                Cambiar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="rounded-2xl border border-border bg-surface shadow-[var(--shadow-glass)] p-6 space-y-4 dark:bg-slate-900/60 dark:border-white/6">
          <h3 className="font-semibold flex items-center gap-2 text-foreground">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Resultado de la importación
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{result.inserted_count}</p>
              <p className="text-sm text-muted-foreground">Actividades insertadas</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{result.duplicate_count ?? 0}</p>
              <p className="text-sm text-muted-foreground">Duplicados omitidos</p>
            </div>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-2xl font-bold text-destructive">{result.errors?.length ?? 0}</p>
              <p className="text-sm text-muted-foreground">Errores</p>
            </div>
          </div>

          {result.duplicates && result.duplicates.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <CopyX className="w-4 h-4 text-amber-500 shrink-0" />
                Detalle de actividades omitidas por duplicación ({result.duplicates.length}):
              </p>
              <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                {result.duplicates.map((d, idx) => (
                  <div key={idx} className="text-xs text-amber-800 dark:text-amber-200">
                    • <span className="font-semibold text-amber-900 dark:text-amber-100">{d.title}</span> {d.row ? `(Fila ${d.row})` : ''} ya se encuentra registrada en la base de datos.
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.conflicts && result.conflicts.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                Choques de fechas detectados con la carrera ({result.conflicts.length}):
              </p>
              <div className="max-h-48 overflow-y-auto space-y-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                {result.conflicts.map((c, idx) => (
                  <div key={idx} className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                    • <span className="font-semibold text-amber-900 dark:text-amber-100">{c.activity_title}</span> se cruza en fechas ({c.dates}) con la actividad <span className="font-semibold text-amber-900 dark:text-amber-100">&quot;{c.conflicting_title}&quot;</span>.
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.errors && result.errors.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Detalle de errores:
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg bg-muted border border-border p-3">
                {result.errors.map((err, idx) => (
                  <div key={idx} className="text-xs text-destructive font-mono">
                    Fila {err.row}: {err.error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Template download + hint */}
      <div className="rounded-2xl border border-border bg-surface shadow-[var(--shadow-glass)] p-6 dark:bg-slate-900/60 dark:border-white/6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="font-semibold text-foreground">Plantilla de importación</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Descarga el formato en blanco, llénalo y súbelo arriba</p>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shrink-0"
          >
            <Download className="w-4 h-4" />
            Descargar Plantilla .xlsx
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-semibold">
                <th className="pb-2 pr-4">Columna</th>
                <th className="pb-2 pr-4">Tipo</th>
                <th className="pb-2 pr-4">Requerido</th>
                <th className="pb-2">Descripción</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground divide-y divide-border dark:divide-white/5">
              <tr>
                <td className="py-2.5 pr-4 font-mono text-foreground font-medium">title</td>
                <td className="py-2.5 pr-4">texto</td>
                <td className="py-2.5 pr-4 text-emerald-600 dark:text-emerald-400 font-medium">Sí</td>
                <td className="py-2.5">Nombre de la actividad</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-mono text-foreground font-medium">start_date</td>
                <td className="py-2.5 pr-4">fecha</td>
                <td className="py-2.5 pr-4 text-emerald-600 dark:text-emerald-400 font-medium">Sí</td>
                <td className="py-2.5">Fecha de inicio (DD/MM/AAAA o YYYY-MM-DD)</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-mono text-foreground font-medium">end_date</td>
                <td className="py-2.5 pr-4">fecha</td>
                <td className="py-2.5 pr-4 text-emerald-600 dark:text-emerald-400 font-medium">Sí</td>
                <td className="py-2.5">Fecha de fin (DD/MM/AAAA o YYYY-MM-DD)</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-mono text-foreground font-medium">carrera</td>
                <td className="py-2.5 pr-4">desplegable / texto</td>
                <td className="py-2.5 pr-4 text-emerald-600 dark:text-emerald-400 font-medium">Sí</td>
                <td className="py-2.5">Nombre de la carrera o ID (desplegable en Excel)</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-mono text-foreground font-medium">gestion</td>
                <td className="py-2.5 pr-4">desplegable / texto</td>
                <td className="py-2.5 pr-4 text-emerald-600 dark:text-emerald-400 font-medium">Sí</td>
                <td className="py-2.5">Nombre de la gestión (ej. 2-2026) o ID</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-mono text-foreground font-medium">es_cientifica</td>
                <td className="py-2.5 pr-4">desplegable</td>
                <td className="py-2.5 pr-4 text-amber-600 dark:text-amber-400 font-medium">No</td>
                <td className="py-2.5">SI = científica, NO = académica</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-mono text-foreground font-medium">category</td>
                <td className="py-2.5 pr-4">texto</td>
                <td className="py-2.5 pr-4 text-amber-600 dark:text-amber-400 font-medium">Condicional</td>
                <td className="py-2.5">Requerido para académicas (examen, taller, etc.)</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-mono text-foreground font-medium">activity_type</td>
                <td className="py-2.5 pr-4">texto</td>
                <td className="py-2.5 pr-4 text-amber-600 dark:text-amber-400 font-medium">Condicional</td>
                <td className="py-2.5">Requerido para científicas (congreso, webinar, etc.)</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-mono text-foreground font-medium">responsible_name</td>
                <td className="py-2.5 pr-4">texto</td>
                <td className="py-2.5 pr-4 text-amber-600 dark:text-amber-400 font-medium">No</td>
                <td className="py-2.5">Responsable de la actividad</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
