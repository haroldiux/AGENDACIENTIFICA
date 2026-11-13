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
  type Sede,
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
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGlobal, setIsGlobal] = useState(false);

  const [evidences, setEvidences] = useState<ScientificActivityEvidence[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingEvidenceId, setDeletingEvidenceId] = useState<number | null>(null);

  const defaultPilar =
    user?.role === "director_academico_sede"
      ? "academica"
      : "investigacion";

  const [formData, setFormData] = useState({
    title: "",
    start_date: "",
    end_date: "",
    activity_type: "",
    responsible_name: "",
    career_id: "",
    sede_id: user?.sede_id ? String(user.sede_id) : "",
    regimen: "semestral",
    plan_estudio: "",
    pilar: defaultPilar,
    gestion_id: "",
    status: "scheduled" as ScientificActivityStatus,
    category_id: "",
    collaboration_career_ids: [] as number[],
  });

  const isPilarDisabled = user?.role === "director_academico_sede" || user?.role === "jefe_investigacion";
  const isSedeDisabled = !!user?.sede_id && ["vicerrector_sede", "director_academico_sede", "director_investigacion"].includes(user?.role ?? "");

  const allowedPilares = [
    { value: "investigacion", label: "Investigación Científica" },
    { value: "academica", label: "Académico / Docencia" },
    { value: "interaccion_social", label: "Interacción Social" },
    { value: "internacionalizacion", label: "Internacionalización" },
  ].filter((p) => {
    if (user?.role === "director_academico_sede") return p.value === "academica";
    if (user?.role === "jefe_investigacion") return p.value === "investigacion";
    return true;
  });

  useEffect(() => {
    if (!isOpen) return;

    Promise.all([
      api.careers.list(),
      api.gestiones.list(),
      api.sedes.list(),
      api.categories.list("scientific"),
    ])
      .then(([c, g, sList, catList]) => {
        setCareers(c);
        setGestiones(g);
        setSedes(sList);
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
            sede_id: activity.sede_id ? String(activity.sede_id) : (user?.sede_id ? String(user.sede_id) : ""),
            regimen: activity.regimen ?? "semestral",
            plan_estudio: activity.plan_estudio ?? "",
            pilar: activity.pilar ?? defaultPilar,
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
            sede_id: user?.sede_id ? String(user.sede_id) : "",
            regimen: "semestral",
            plan_estudio: "",
            pilar: defaultPilar,
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
      const sede_id = formData.sede_id ? Number(formData.sede_id) : null;

      if (isEdit && activity) {
        await api.scientific.update(activity.id, {
          title: formData.title,
          start_date: formData.start_date,
          end_date: formData.end_date,
          activity_type: formData.activity_type,
          responsible_name: formData.responsible_name || "Sin responsable",
          career_id: career_id,
          sede_id: sede_id,
          regimen: formData.regimen,
          plan_estudio: formData.plan_estudio || null,
          pilar: formData.pilar,
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
          sede_id: sede_id,
          regimen: formData.regimen,
          plan_estudio: formData.plan_estudio || null,
          pilar: formData.pilar,
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
      <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-lg text-foreground max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col dark:bg-slate-900 dark:border-white/10">
        <div className="px-6 py-5 border-b border-border flex items-center gap-3 shrink-0 dark:border-white/5">
          <h2 className="text-xl font-bold text-foreground">
            {isEdit ? "Editar Actividad Científica" : "Nueva Actividad Científica"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1.5 block">Título *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-2.5 bg-background border border-input rounded-lg focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground text-sm dark:bg-slate-800/60 dark:border-white/10"
            />
          </div>

          {canSetGlobal && (
            <div className="flex items-center gap-2 p-2.5 bg-muted/40 border border-border rounded-lg dark:bg-slate-800/40 dark:border-white/5">
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
                className="w-4 h-4 rounded border-input text-primary focus:ring-primary/50 bg-background cursor-pointer dark:bg-slate-800 dark:border-white/10"
              />
              <label htmlFor="is_global_toggle" className="text-sm font-medium flex items-center gap-1.5 cursor-pointer text-foreground">
                <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                Es actividad global / institucional (Vicerrectorado)
              </label>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1.5 block">Fecha Inicio *</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full p-2.5 bg-background border border-input rounded-lg focus:outline-none focus:border-primary/50 text-foreground text-sm dark:bg-slate-800/60 dark:border-white/10"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1.5 block">Fecha Fin *</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="w-full p-2.5 bg-background border border-input rounded-lg focus:outline-none focus:border-primary/50 text-foreground text-sm dark:bg-slate-800/60 dark:border-white/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1.5 block">Sede Académica</label>
              <select
                name="sede_id"
                value={formData.sede_id}
                onChange={handleChange}
                disabled={isSedeDisabled}
                className="w-full p-2.5 bg-background border border-input rounded-lg focus:outline-none focus:border-primary/50 text-foreground text-sm disabled:opacity-50 dark:bg-slate-800/60 dark:border-white/10"
              >
                <option value="">Nacional / Todas las sedes</option>
                {sedes.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1.5 block">Pilar Institucional *</label>
              <select
                name="pilar"
                value={formData.pilar}
                onChange={handleChange}
                disabled={isPilarDisabled}
                className="w-full p-2.5 bg-background border border-input rounded-lg focus:outline-none focus:border-primary/50 text-foreground text-sm disabled:opacity-50 dark:bg-slate-800/60 dark:border-white/10"
              >
                {allowedPilares.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1.5 block">Régimen</label>
              <select
                name="regimen"
                value={formData.regimen}
                onChange={handleChange}
                className="w-full p-2.5 bg-background border border-input rounded-lg focus:outline-none focus:border-primary/50 text-foreground text-sm dark:bg-slate-800/60 dark:border-white/10"
              >
                <option value="semestral">Semestral</option>
                <option value="anual">Anual</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1.5 block">Plan de Estudio (Pensum)</label>
              <input
                type="text"
                name="plan_estudio"
                placeholder="Ej. Plan 2023, Plan 2018"
                value={formData.plan_estudio}
                onChange={handleChange}
                className="w-full p-2.5 bg-background border border-input rounded-lg focus:outline-none focus:border-primary/50 text-foreground text-sm dark:bg-slate-800/60 dark:border-white/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Req 1B — Career dropdown pre-fill + lock */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1.5 block">Carrera {!isGlobal && "*"}</label>
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
                className="w-full p-2.5 bg-background border border-input rounded-lg focus:outline-none focus:border-primary/50 text-foreground text-sm disabled:opacity-50 dark:bg-slate-800/60 dark:border-white/10"
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
              <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1.5 block">Gestión *</label>
              <select
                name="gestion_id"
                value={formData.gestion_id}
                onChange={handleChange}
                required
                disabled={isEdit}
                title={isEdit ? "La gestión no se puede cambiar al editar" : undefined}
                className="w-full p-2.5 bg-background border border-input rounded-lg focus:outline-none focus:border-primary/50 text-foreground text-sm disabled:opacity-50 dark:bg-slate-800/60 dark:border-white/10"
              >
                <option value="">Seleccione...</option>
                {gestiones.map((g) => (
                  <option key={g.id} value={g.id}>{formatGestion(g.name)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1.5 block">Carreras en Colaboración</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2.5 bg-muted/40 border border-border rounded-lg custom-scrollbar dark:bg-slate-800/40 dark:border-white/5">
              {careers
                .filter((c) => c.id !== Number(formData.career_id))
                .map((c) => {
                  const isSelected = formData.collaboration_career_ids.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 cursor-pointer text-sm text-foreground/80 hover:text-foreground transition-colors"
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
                        className="w-4 h-4 rounded border-input text-primary focus:ring-primary/50 bg-background cursor-pointer dark:bg-slate-800 dark:border-white/10"
                      />
                      <span className="truncate" title={c.name}>{c.name}</span>
                    </label>
                  );
                })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Selecciona las carreras que colaborarán en esta actividad.
            </p>
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1.5 block">Tipo de Evento *</label>
            <select
              name="activity_type"
              value={formData.activity_type}
              onChange={handleChange}
              required
              className="w-full p-2.5 bg-background border border-input rounded-lg focus:outline-none focus:border-primary/50 text-foreground text-sm dark:bg-slate-800/60 dark:border-white/10"
            >
              <option value="">Seleccione el tipo de evento...</option>
              <option value="congreso">Congreso</option>
              <option value="webinar">Webinar</option>
              <option value="defensa">Defensa</option>
              <option value="feria">Feria</option>
              <option value="olimpiada">Olimpiada</option>
              <option value="master_class">Master Class</option>
            </select>
            <p className="text-[11px] text-muted-foreground mt-1.5">Formato o categoría principal del evento científico.</p>
          </div>

          {isEdit && (
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1.5 block">Estado</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2.5 bg-background border border-input rounded-lg focus:outline-none focus:border-primary/50 text-foreground text-sm dark:bg-slate-800/60 dark:border-white/10"
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
            <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1.5 block">Responsable</label>
            <input
              type="text"
              name="responsible_name"
              value={formData.responsible_name}
              onChange={handleChange}
              className="w-full p-2.5 bg-background border border-input rounded-lg focus:outline-none focus:border-primary/50 text-foreground text-sm dark:bg-slate-800/60 dark:border-white/10"
            />
          </div>

          <div className="border-t border-border pt-4 mt-6 dark:border-white/5">
            <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2 flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-primary" />
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
                  className="border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 p-4 rounded-lg text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1.5 dark:border-white/10 dark:bg-slate-800/30"
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
                    <div className="flex items-center gap-2 text-primary text-xs py-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Subiendo evidencia...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-muted-foreground mb-0.5" />
                      <p className="text-xs font-medium text-foreground">
                        Arrastra y suelta un archivo aquí, o <span className="text-primary hover:underline">haz clic para seleccionar</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">PDF, PNG, JPG, DOCX (Máximo 10 MB)</p>
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
                          className="flex items-center justify-between p-2 bg-muted/40 border border-border rounded-md text-xs dark:bg-slate-800/40 dark:border-white/5"
                        >
                          <div className="flex items-center gap-2 truncate min-w-0 mr-2">
                            <FileText className="w-4 h-4 text-primary shrink-0" />
                            <div className="truncate">
                              <p className="font-medium text-foreground truncate">{ev.filename}</p>
                              <p className="text-[10px] text-muted-foreground">{sizeKB} KB</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="p-1 text-muted-foreground hover:text-primary transition-colors"
                              title="Descargar evidencia"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteEvidence(ev.id)}
                              disabled={deletingEvidenceId === ev.id}
                              className="p-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
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
              <p className="text-xs text-muted-foreground italic">
                Podrás adjuntar archivos y evidencias una vez guardada la actividad.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border hover:bg-muted rounded-lg transition-colors text-foreground text-sm font-medium dark:border-white/10 dark:hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              data-testid="activity-save-button"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 rounded-lg transition-colors text-sm font-medium"
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
