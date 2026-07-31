"use client";
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ActivityModal from './components/ActivityModal';
import UploadDropzone from './components/UploadDropzone';
import { Toaster } from 'react-hot-toast';

export default function ActividadesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    // Optionally trigger a re-fetch of data here
    console.log("Actividad agregada / Archivo subido con éxito");
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center glass-panel p-4 rounded-xl">
        <h3 className="text-lg font-medium">Gestión de Actividades Científicas</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Actividad
        </button>
      </div>

      <UploadDropzone onSuccess={handleSuccess} />

      <div className="glass-panel p-6 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-slate-400 text-sm">
                <th className="pb-3 font-medium">Nombre</th>
                <th className="pb-3 font-medium">Fecha</th>
                <th className="pb-3 font-medium">Carrera</th>
                <th className="pb-3 font-medium">Estado</th>
                <th className="pb-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              <tr>
                <td className="py-4 font-medium text-white">Feria Científica Medicina</td>
                <td className="py-4">15 Oct 2025</td>
                <td className="py-4">Medicina</td>
                <td className="py-4"><span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">Confirmado</span></td>
                <td className="py-4 text-right">
                  <button className="text-slate-400 hover:text-white text-sm">Editar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ActivityModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess}
      />
    </div>
  );
}
