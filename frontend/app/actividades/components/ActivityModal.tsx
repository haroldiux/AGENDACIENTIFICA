"use client";
import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import {
  Upload,
  FileText,
  Trash2,
  Download,
  Loader2,
  Paperclip,
  Globe,
} from "lucide-react";
import {
  api,
  type ActivityCategory,
  type Career,
  type Gestion,
  type ScientificActivity,
  type ScientificActivityEvidence,
  type ScientificActivityStatus,
} from "@/lib/api";
import { activityStatusLabels } from "@/components/agenda/agenda-helpers";
import { useUser } from "@/context/AuthContext";
import { config as appConfig } from "@/lib/config";

/** Converts '1-2026' -> 'Semestre 1 – 2026', leaves unknown formats as-is. */
function formatGestion(name: string): string {
  const match = name.match(/^([12])-(\d{4})$/);
  if (match) return `Semestre ${match[1]} – ${match[2]}`;
  return name;
}

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

const CAREER_SCOPED_ROLES = ["jefe_investigacion", "coordinator"];

export default function ActivityModal({
  isOpen,
  onClose,
  onSuccess,
  activity = null,
}: ActivityModalProps) {
  const isEdit = activity !== null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();

  // Role-derived flags
  const canSetGlobal = !CAREER_SCOPED_ROLES.includes(user?.role ?? "");

  const [careers, setCareers] = useState<Career[]>([]);
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGlobal, setIsGlobal] = useState(false);

  const [evidences, setEvidences] = useState<ScientificActivityEvidence[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingEvidenceId, setDeletingEvidenceId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    start_date: "",
    end_date: "",
    activity_type: "",
    responsible_name: "",
    career_id: "",
    gestion_id: "",
    status: "scheduled" as ScientificActivityStatus,
    category_id: "",
    collaboration_career_ids: [] as number[],
  });

  useEffect(() => {
    if (!isOpen) return;

    Promise.all([
      api.careers.list(),
      api.gestiones.list(),
      api.categories.list("scientific"),
    ])
      .then(([c, g, catList]) => {
        setCareers(c);
        setGestiones(g);
        setCategories(catList);

        // Req 1B — derive careers available to this user
        const userCareers = user?.careers ?? [];
        const defaultCareerId =
          userCareers.length > 0
            ? String(userCareers[0].id)
            : c.length > 0
            ? String(c[0].id)
            : "";

        if (activity) {
          const global = activity.career_id === null || activity.career_id === undefined;
          setIsGlobal(global);
          setFormData({
            title: activity.title,
            start_date: activity.start_date,
            end_date: activity.end_date,
            activity_type: activity.activity_type,
            responsible_name: activity.responsible_name ?? "",
            career_id: global ? "" : String(activity.career_id),
            gestion_id: String(activity.gestion_id),
            status: activity.status,
            category_id: activity.category_id ? String(activity.category_id) : "",
            collaboration_career_ids: activity.collaboration_career_ids ?? [],
          });

          // Fetch evidences for edit mode
          api.scientific
            .listEvidences(activity.id)
            .then((evList) => setEvidences(evList))
            .catch(() => setEvidences([]));
        } else {
          setIsGlobal(false);
          setEvidences([]);
          
          let defaultGestionId = "";
          if (g.length > 0) {
            const today = new Date();
            const activeGestion = g.find((gestion) => {
              const start = new Date(gestion.start_date);
              const end = new Date(gestion.end_date);
              return today >= start && today <= end;
            });
            if (activeGestion) {
              defaultGestionId = String(activeGestion.id);
            } else {
              const mostRecent = [...g].sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime())[0];
              defaultGestionId = String(mostRecent.id);
            }
          }

          setFormData({
            title: "",
            start_date: "",
            end_date: "",
            activity_type: "",
            responsible_name: "",
            career_id: defaultCareerId,
            gestion_id: defaultGestionId,
            status: "scheduled",
            category_id: "",
            collaboration_career_ids: [],
          });
        }
      })
      .catch(() => toast.error("Error cargando carreras, gestiones y categorías"));
  }, [isOpen, activity, user]);

  // Req 1B — restrict career options to user's careers when career-scoped role
  const userCareers = user?.careers ?? [];
  const effectiveCareers =
    userCareers.length > 0
      ? careers.filter((c) => userCareers.some((u) => u.id === c.id))
      : careers;

  // career dropdown disabled conditions
  const isCareerDisabled = isEdit || isGlobal || userCareers.length === 1;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (file: File) => {
    if (!activity) return;
    setIsUploading(true);
    try {
      const newEv = await api.scientific.uploadEvidence(activity.id, file);
      toast.success("Evidencia adjuntada exitosamente");
      setEvidences((prev) => [...prev, newEv]);
    } catch {
      toast.error("Error al subir archivo. Verifique formato (PDF, PNG, JPG, DOCX) y tamaño (máx 10MB).");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteEvidence = async (evidenceId: number) => {
    setDeletingEvidenceId(evidenceId);
    try {
      await api.scientific.deleteEvidence(evidenceId);
      toast.success("Evidencia eliminada");
      setEvidences((prev) => prev.filter((e) => e.id !== evidenceId));
    } catch {
      toast.error("Error al eliminar evidencia");
    } finally {
      setDeletingEvidenceId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const career_id = isGlobal ? null : (formData.career_id ? Number(formData.career_id) : null);
      const category_id = formData.category_id ? Number(formData.category_id) : null;

      if (isEdit && activity) {
        await api.scientific.update(activity.id, {
          title: formData.title,
          start_date: formData.start_date,
          end_date: formData.end_date,
          activity_type: formData.activity_type,
          responsible_name: formData.responsible_name || "Sin responsable",
          career_id: career_id,
          category_id: category_id,
          collaboration_career_ids: formData.collaboration_career_ids,
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
          career_id: career_id,
          gestion_id: Number(formData.gestion_id),
          category_id: category_id,
          collaboration_career_ids: formData.collaboration_career_ids,
        });
        toast.success("Actividad creada exitosamente");
      }
      onSuccess();
      onClose();
    } catch {
      toast.error(
        isEdit ? "Error al actualizar la actividad" : "Error al crear la actividad"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card text-card-foreground border border-border shadow-lg p-6 rounded-xl w-full max-w-lg text-white max-h-[90vh] overflow-y-auto">
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

          {/* Req 1A — Global Scope Toggle: hidden for career-scoped roles */}
          {canSetGlobal && (
            <div className="flex items-center gap-2 p-2.5 bg-[#0f172a]/80 border border-[var(--border)] rounded-lg">
              <input
                type="checkbox"
                id="is_global_toggle"
                checked={isGlobal}
                onChange={(e) => {
                  setIsGlobal(e.target.checked);
                  if (e.target.checked) {
                    setFormData((prev) => ({ ...prev, career_id: "" }));
                  }
                }}
                className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-slate-800 cursor-pointer"
              />
              <label htmlFor="is_global_toggle" className="text-sm font-medium flex items-center gap-1.5 cursor-pointer text-slate-200">
                <Globe className="w-4 h-4 text-purple-400 shrink-0" />
                Es actividad global / institucional (Vicerrectorado)
              </label>
            </div>
          )}

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
            {/* Req 1B — Career dropdown pre-fill + lock */}
            <div>
              <label className="block text-sm font-medium mb-1">Carrera {!isGlobal && "*"}</label>
              <select
                name="career_id"
                value={isGlobal ? "" : formData.career_id}
                onChange={handleChange}
                required={!isGlobal}
                disabled={isCareerDisabled}
                title={
                  isEdit
                    ? "La carrera no se puede cambiar al editar"
                    : isGlobal
                    ? "Actividad institucional global"
                    : userCareers.length === 1
                    ? "Carrera asignada a tu usuario"
                    : undefined
                }
                className="w-full p-2.5 bg-[#0f172a] border border-[var(--border)] rounded-lg focus:outline-none focus:border-blue-500 text-sm disabled:opacity-50"
              >
                {isGlobal ? (
                  <option value="">Global / Vicerrectorado</option>
                ) : (
                  <>
                    <option value="">Seleccione...</option>
                    {effectiveCareers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </>
                )}
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
                  <option key={g.id} value={g.id}>{formatGestion(g.name)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Req 1C — Collaboration careers checkboxes */}
          <div>
            <label className="block text-sm font-medium mb-1">Carreras en Colaboración</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2.5 bg-[#0f172a] border border-[var(--border)] rounded-lg custom-scrollbar">
              {careers
                .filter((c) => c.id !== Number(formData.career_id))
                .map((c) => {
                  const isSelected = formData.collaboration_career_ids.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 cursor-pointer text-sm text-slate-200 hover:text-white transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          setFormData((prev) => {
                            const newIds = e.target.checked
                              ? [...prev.collaboration_career_ids, c.id]
                              : prev.collaboration_career_ids.filter((id) => id !== c.id);
                            return { ...prev, collaboration_career_ids: newIds };
                          });
                        }}
                        className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-slate-800 cursor-pointer"
                      />
                      <span className="truncate" title={c.name}>{c.name}</span>
                    </label>
                  );
                })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Selecciona las carreras que colaborarán en esta actividad.
            </p>
          </div>

          {/* Tipo de Evento / Categoría de la Actividad */}
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Evento *</label>
            <select
              name="activity_type"
              value={formData.activity_type}
              onChange={handleChange}
              required
              className="w-full p-2.5 bg-[#0f172a] border border-[var(--border)] rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="">Seleccione el tipo de evento...</option>
              <option value="congreso">Congreso</option>
              <option value="webinar">Webinar</option>
              <option value="defensa">Defensa</option>
              <option value="feria">Feria</option>
              <option value="olimpiada">Olimpiada</option>
              <option value="master_class">Master Class</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">Formato o categoría principal del evento científico.</p>
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

          {/* Evidence Attachments Section */}
          <div className="border-t border-[var(--border)] pt-4 mt-4">
            <label className="block text-sm font-semibold mb-2 flex items-center gap-1.5 text-slate-200">
              <Paperclip className="w-4 h-4 text-blue-400" />
              Evidencias y Adjuntos (PDF, Imágenes, DOCX)
            </label>

            {isEdit && activity ? (
              <div className="space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      Array.from(e.dataTransfer.files).forEach((file) => handleFileUpload(file));
                    }
                  }}
                  className="border-2 border-dashed border-slate-700 hover:border-blue-500 bg-[#0f172a]/40 p-4 rounded-lg text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1.5"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.docx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        Array.from(e.target.files).forEach((file) => handleFileUpload(file));
                      }
                    }}
                    className="hidden"
                  />
                  {isUploading ? (
                    <div className="flex items-center gap-2 text-blue-400 text-xs py-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Subiendo evidencia...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-slate-400 mb-0.5" />
                      <p className="text-xs font-medium text-slate-300">
                        Arrastra y suelta un archivo aquí, o <span className="text-blue-400 underline">haz clic para seleccionar</span>
                      </p>
                      <p className="text-[11px] text-slate-500">PDF, PNG, JPG, DOCX (Máximo 10 MB)</p>
                    </>
                  )}
                </div>

                {evidences.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {evidences.map((ev) => {
                      const apiHost = appConfig.apiHost;
                      const fileUrl = `${apiHost}/${ev.file_path.replace(/\\/g, '/')}`;
                      const sizeKB = (ev.file_size / 1024).toFixed(1);

                      return (
                        <div
                          key={ev.id}
                          className="flex items-center justify-between p-2 bg-[#0f172a] border border-[var(--border)] rounded-md text-xs"
                        >
                          <div className="flex items-center gap-2 truncate min-w-0 mr-2">
                            <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                            <div className="truncate">
                              <p className="font-medium text-slate-200 truncate">{ev.filename}</p>
                              <p className="text-[10px] text-slate-400">{sizeKB} KB</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                              title="Descargar evidencia"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteEvidence(ev.id)}
                              disabled={deletingEvidenceId === ev.id}
                              className="p-1 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                              title="Eliminar evidencia"
                            >
                              {deletingEvidenceId === ev.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Podrás adjuntar archivos y evidencias una vez guardada la actividad.
              </p>
            )}
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
              data-testid="activity-save-button"
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
