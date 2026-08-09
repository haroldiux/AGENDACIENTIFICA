"use client";

import { useState, useRef, useCallback } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle, X, Loader2, Download } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { api } from "@/lib/api";
import PageHeader from "@/components/layout/PageHeader";
import { config as appConfig } from "@/lib/config";

interface UploadResult {
  inserted_count: number;
  errors: { row: number; error: string }[];
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
          bg-card text-card-foreground border border-border shadow-sm rounded-xl p-12 text-center cursor-pointer transition-all
          ${isDragging ? "border-blue-500 bg-blue-500/5" : "border-dashed border-2 border-[var(--border)]"}
          ${file ? "cursor-default" : "hover:bg-white/5"}
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
            <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-slate-300 font-medium">Arrastra y suelta tu archivo aquí</p>
              <p className="text-slate-500 text-sm mt-1">o haz clic para seleccionar</p>
            </div>
            <p className="text-xs text-slate-600">Formatos aceptados: .xlsx, .xls (máx. 10 MB)</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <div>
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-slate-500 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload();
                }}
                disabled={isUploading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
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
                className="bg-white/10 hover:bg-white/15 text-slate-300 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
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
        <div className="bg-card text-card-foreground border border-border shadow-sm p-6 rounded-xl space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Resultado de la importación
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-2xl font-bold text-green-400">{result.inserted_count}</p>
              <p className="text-sm text-slate-400">Actividades insertadas</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-2xl font-bold text-red-400">{result.errors?.length ?? 0}</p>
              <p className="text-sm text-slate-400">Errores</p>
            </div>
          </div>

          {result.errors && result.errors.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Detalle de errores:
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg bg-black/20 p-3">
                {result.errors.map((err, idx) => (
                  <div key={idx} className="text-xs text-red-300 font-mono">
                    Fila {err.row}: {err.error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Template download + hint */}
      <div className="bg-card text-card-foreground border border-border shadow-sm p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-slate-200">Plantilla de importación</h4>
            <p className="text-xs text-slate-500 mt-0.5">Descarga el formato en blanco, llénalo y súbelo arriba</p>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Descargar Plantilla .xlsx
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-slate-500">
                <th className="pb-2 pr-4">Columna</th>
                <th className="pb-2 pr-4">Tipo</th>
                <th className="pb-2 pr-4">Requerido</th>
                <th className="pb-2">Descripción</th>
              </tr>
            </thead>
            <tbody className="text-slate-400 divide-y divide-[var(--border)]">
              <tr>
                <td className="py-2 pr-4 font-mono text-slate-300">title</td>
                <td className="py-2 pr-4">texto</td>
                <td className="py-2 pr-4 text-green-400">Sí</td>
                <td className="py-2">Nombre de la actividad</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-slate-300">start_date</td>
                <td className="py-2 pr-4">fecha</td>
                <td className="py-2 pr-4 text-green-400">Sí</td>
                <td className="py-2">Fecha de inicio (YYYY-MM-DD)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-slate-300">end_date</td>
                <td className="py-2 pr-4">fecha</td>
                <td className="py-2 pr-4 text-green-400">Sí</td>
                <td className="py-2">Fecha de fin (YYYY-MM-DD)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-slate-300">career_id</td>
                <td className="py-2 pr-4">número</td>
                <td className="py-2 pr-4 text-green-400">Sí</td>
                <td className="py-2">ID de la carrera</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-slate-300">gestion_id</td>
                <td className="py-2 pr-4">número</td>
                <td className="py-2 pr-4 text-green-400">Sí</td>
                <td className="py-2">ID de la gestión</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-slate-300">is_scientific</td>
                <td className="py-2 pr-4">booleano</td>
                <td className="py-2 pr-4 text-amber-400">No</td>
                <td className="py-2">true = científica, false/omitido = académica</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-slate-300">category</td>
                <td className="py-2 pr-4">texto</td>
                <td className="py-2 pr-4 text-amber-400">Condicional</td>
                <td className="py-2">Requerido para académicas (examen, taller, etc.)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-slate-300">activity_type</td>
                <td className="py-2 pr-4">texto</td>
                <td className="py-2 pr-4 text-amber-400">Condicional</td>
                <td className="py-2">Requerido para científicas (congreso, webinar, etc.)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-slate-300">responsible_name</td>
                <td className="py-2 pr-4">texto</td>
                <td className="py-2 pr-4 text-amber-400">No</td>
                <td className="py-2">Responsable de la actividad</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
