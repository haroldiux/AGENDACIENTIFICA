"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ActivityModal({ isOpen, onClose, onSuccess }: ActivityModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    start_date: "",
    end_date: "",
    activity_type: "",
    category: "",
    responsible_name: "",
    career_id: 1, // default mock value
    gestion_id: 1, // default mock value
    is_scientific: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/actividades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          career_id: Number(formData.career_id),
          gestion_id: Number(formData.gestion_id),
          activity_type: formData.activity_type || null,
          category: formData.category || null,
          responsible_name: formData.responsible_name || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create activity");
      }

      toast.success("Actividad creada exitosamente");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Error al crear la actividad");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-slate-800 p-6 rounded-xl w-full max-w-md shadow-lg border border-slate-700 text-white">
        <h2 className="text-xl font-bold mb-4">Nueva Actividad</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Fin</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium">
              <input
                type="checkbox"
                name="is_scientific"
                checked={formData.is_scientific}
                onChange={handleChange}
                className="rounded border-slate-700 bg-slate-900"
              />
              <span>Es Actividad Científica</span>
            </label>
          </div>

          {formData.is_scientific && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Actividad</label>
                <select
                  name="activity_type"
                  value={formData.activity_type}
                  onChange={handleChange}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Seleccione...</option>
                  <option value="congreso">Congreso</option>
                  <option value="webinar">Webinar</option>
                  <option value="defensa">Defensa</option>
                  <option value="feria">Feria</option>
                  <option value="olimpiada">Olimpiada</option>
                  <option value="master_class">Master Class</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Responsable</label>
                <input
                  type="text"
                  name="responsible_name"
                  value={formData.responsible_name}
                  onChange={handleChange}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          {!formData.is_scientific && (
            <div>
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-white"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
