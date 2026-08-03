"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Upload, Trash2, Pencil, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import ActivityModal from "./components/ActivityModal";
import AgendaFilterBar from "@/components/agenda/AgendaFilterBar";
import PageHeader from "@/components/layout/PageHeader";
import {
  api,
  type Career,
  type Gestion,
  type ScientificActivity,
  type ScientificActivityStatus,
} from "@/lib/api";
import {
  activityStatusClasses,
  activityStatusLabels,
  activityTypeLabels,
  formatDateRange,
} from "@/components/agenda/agenda-helpers";

export default function ActividadesPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [careerId, setCareerId] = useState<number | null>(null);
  const [gestionId, setGestionId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<ScientificActivityStatus | "">("");

  const [activities, setActivities] = useState<ScientificActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ScientificActivity | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Load selector options once on mount.
  useEffect(() => {
    let cancelled = false;
    Promise.all([api.careers.list(), api.gestiones.list()])
      .then(([careersData, gestionesData]) => {
        if (!cancelled) {
          setCareers(careersData);
          setGestiones(gestionesData);
        }
      })
      .catch(() => {
        if (!cancelled) toast.error("Error cargando carreras y gestiones");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadActivities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.scientific.list({
        career_id: careerId ?? undefined,
        gestion_id: gestionId ?? undefined,
      });
      setActivities(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las actividades. Intente de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  }, [careerId, gestionId]);

  // Fetch activities when filters change.
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const visibleActivities = statusFilter
    ? activities.filter((a) => a.status === statusFilter)
    : activities;

  const careerName = (id: number) =>
    careers.find((c) => c.id === id)?.name ?? `#${id}`;

  const openCreateModal = () => {
    setEditingActivity(null);
    setIsModalOpen(true);
  };

  const openEditModal = (activity: ScientificActivity) => {
    setEditingActivity(activity);
    setIsModalOpen(true);
  };

  const handleDelete = async (activity: ScientificActivity) => {
    const confirmed = window.confirm(
      `¿Eliminar la actividad "${activity.title}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setDeletingId(activity.id);
    try {
      await api.scientific.delete(activity.id);
      toast.success("Actividad eliminada");
      await loadActivities();
    } catch {
      toast.error("No se pudo eliminar la actividad");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <PageHeader
        title="Actividades Científicas"
        description="Crea, edita y da seguimiento a las actividades de investigación por carrera y gestión."
        actions={
          <>
            <Link
              href="/importar"
              className="bg-white/10 hover:bg-white/15 text-slate-200 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Importar Excel
            </Link>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/25"
            >
              <Plus className="w-4 h-4" />
              Nueva Actividad
            </button>
          </>
        }
      />

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <AgendaFilterBar
            careers={careers}
            gestiones={gestiones}
            careerId={careerId}
            gestionId={gestionId}
            onCareerChange={setCareerId}
            onGestionChange={setGestionId}
          />
        </div>
        <div className="glass-panel p-4 rounded-xl flex flex-col gap-1.5 md:w-56">
          <label htmlFor="status-select" className="text-xs text-slate-400">
            Estado
          </label>
          <select
            id="status-select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as ScientificActivityStatus | "")
            }
            className="w-full bg-[#1e293b] border border-[var(--border)] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos los estados</option>
            {Object.entries(activityStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-300 text-sm">{error}</p>
            <button
              onClick={loadActivities}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : visibleActivities.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-12">
            No hay actividades con los filtros seleccionados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] text-slate-400 text-sm">
                  <th className="pb-3 font-medium">Nombre</th>
                  <th className="pb-3 font-medium">Fecha</th>
                  <th className="pb-3 font-medium">Tipo</th>
                  <th className="pb-3 font-medium">Carrera</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {visibleActivities.map((activity) => (
                  <tr key={activity.id}>
                    <td className="py-4 font-medium text-white">{activity.title}</td>
                    <td className="py-4 text-sm whitespace-nowrap">
                      {formatDateRange(activity.start_date, activity.end_date)}
                    </td>
                    <td className="py-4">
                      <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">
                        {activityTypeLabels[activity.activity_type] ??
                          activity.activity_type}
                      </span>
                    </td>
                    <td className="py-4 text-sm">{careerName(activity.career_id)}</td>
                    <td className="py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          activityStatusClasses[activity.status] ?? ""
                        }`}
                      >
                        {activityStatusLabels[activity.status] ?? activity.status}
                      </span>
                    </td>
                    <td className="py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(activity)}
                        className="text-slate-400 hover:text-white text-sm inline-flex items-center gap-1 mr-3 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(activity)}
                        disabled={deletingId === activity.id}
                        className="text-slate-400 hover:text-red-400 text-sm inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        {deletingId === activity.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadActivities}
        activity={editingActivity}
      />
    </div>
  );
}
