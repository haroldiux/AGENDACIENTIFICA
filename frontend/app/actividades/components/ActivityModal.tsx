"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  api,
  type Career,
  type Gestion,
  type ScientificActivity,
  type ScientificActivityStatus,
} from "@/lib/api";
import { activityStatusLabels } from "@/components/agenda/agenda-helpers";

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** When provided, the modal edits this activity instead of creating a new one. */
  activity?: ScientificActivity | null;
}

const STATUS_OPTIONS: ScientificActivityStatus[] = [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
];

export default function ActivityModal({
  isOpen,
  onClose,
  onSuccess,
  activity = null,
}: ActivityModalProps) {
  const isEdit = activity !== null;
  const [careers, setCareers] = useState<Career[]>([]);
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    start_date: "",
    end_date: "",
    activity_type: "",
    responsible_name: "",
    career_id: "",
    gestion_id: "",
    status: "scheduled" as ScientificActivityStatus,
  });

  useEffect(() => {
    if (!isOpen) return;

    Promise.all([api.careers.list(), api.gestiones.list()])
      .then(([c, g]) => {
        setCareers(c);
        setGestiones(g);

        if (activity) {
          setFormData({
            title: activity.title,
            start_date: activity.start_date,
            end_date: activity.end_date,
            activity_type: activity.activity_type,
            responsible_name: activity.responsible_name ?? "",
            career_id: String(activity.career_id),
            gestion_id: String(activity.gestion_id),
            status: activity.status,
          });
        } else {
          setFormData({
            title: "",
            start_date: "",
            end_date: "",
            activity_type: "",
            responsible_name: "",
            career_id: c.length > 0 ? String(c[0].id) : "",
            gestion_id: g.length > 0 ? String(g[0].id) : "",
            status: "scheduled",
          });
        }
      })
      .catch(() => toast.error("Error cargando carreras y gestiones"));
  }, [isOpen, activity]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEdit && activity) {
        await api.scientific.update(activity.id, {
          title: formData.title,
          start_date: formData.start_date,
          end_date: formData.end_date,
          activity_type: formData.activity_type,
          responsible_name: formData.responsible_name || "Sin responsable",
        });
        if (formData.status !== activity.status) {
          await api.scientific.updateStatus(activity.id, formData.status);
        }
        toast.success("Actividad actualizada exitosamente");
      } else {
        await api.scientific.create({
          title: formData.title,
          start_date: formData.start_date,
          end_date: formData.end_date,
          activity_type: formData.activity_type,
          responsible_name: formData.responsible_name || "Sin responsable",
          career_id: Number(formData.career_id),
          gestion_id: Number(formData.gestion_id),
        });
        toast.success("Actividad creada exitosamente");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        isEdit ? "Error al actualizar la actividad" : "Error al crear la actividad"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-panel p-6 rounded-xl w-full max-w-md shadow-lg text-white">
        <h2 className="text-xl font-bold mb-4">
          {isEdit ? "Editar Actividad Científica" : "Nueva Actividad Científica"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-2.5 bg-[#0f172a] border border-[var(--border)] rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Inicio *</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full p-2.5 bg-[#0f172a] border border-[var(--border)] rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Fin *</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="w-full p-2.5 bg-[#0f172a] border border-[var(--border)] rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Carrera *</label>
              <select
                name="career_id"
                value={formData.career_id}
                onChange={handleChange}
                required
                disabled={isEdit}
                title={isEdit ? "La carrera no se puede cambiar al editar" : undefined}
                className="w-full p-2.5 bg-[#0f172a] border border-[var(--border)] rounded-lg focus:outline-none focus:border-blue-500 text-sm disabled:opacity-50"
              >
                <option value="">Seleccione...</option>
                {careers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gestión *</label>
              <select
                name="gestion_id"
                value={formData.gestion_id}
                onChange={handleChange}
                required
                disabled={isEdit}
                title={isEdit ? "La gestión no se puede cambiar al editar" : undefined}
                className="w-full p-2.5 bg-[#0f172a] border border-[var(--border)] rounded-lg focus:outline-none focus:border-blue-500 text-sm disabled:opacity-50"
              >
                <option value="">Seleccione...</option>
                {gestiones.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={isEdit ? "grid grid-cols-2 gap-4" : ""}>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Actividad *</label>
              <select
                name="activity_type"
                value={formData.activity_type}
                onChange={handleChange}
                required
                className="w-full p-2.5 bg-[#0f172a] border border-[var(--border)] rounded-lg focus:outline-none focus:border-blue-500 text-sm"
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
            {isEdit && (
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-[#0f172a] border border-[var(--border)] rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {activityStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Responsable</label>
            <input
              type="text"
              name="responsible_name"
              value={formData.responsible_name}
              onChange={handleChange}
              className="w-full p-2.5 bg-[#0f172a] border border-[var(--border)] rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors text-white text-sm"
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
