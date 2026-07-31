"use client";
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

interface UploadDropzoneProps {
  onSuccess?: () => void;
}

export default function UploadDropzone({ onSuccess }: UploadDropzoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    // Validate file type just in case
    if (!file.name.endsWith('.xlsx')) {
      toast.error('Por favor suba un archivo Excel (.xlsx)');
      return;
    }

    setIsUploading(true);
    setProgress(20);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-excel', {
        method: 'POST',
        body: formData,
      });

      setProgress(80);

      if (!response.ok) {
        throw new Error('Error en la subida del archivo');
      }

      const data = await response.json();
      setProgress(100);
      toast.success(`Archivo procesado: ${data.inserted_count || 0} registros insertados.`);
      
      if (data.errors && data.errors.length > 0) {
        toast.error(`Hubo errores en ${data.errors.length} filas.`);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Ocurrió un error al subir el archivo.');
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 1000);
    }
  }, [onSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false
  });

  return (
    <div className="mt-6 mb-6">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'}`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="space-y-4">
            <p className="text-slate-300">Subiendo archivo...</p>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        ) : (
          <div>
            {isDragActive ? (
              <p className="text-blue-400">Suelte el archivo aquí...</p>
            ) : (
              <p className="text-slate-400">
                Arrastre y suelte un archivo Excel (.xlsx) aquí, o haga clic para seleccionar
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
