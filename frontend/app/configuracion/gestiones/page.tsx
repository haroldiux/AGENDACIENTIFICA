"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Plus,
  Pencil,
  Search,
  X,
  Loader2,
  CalendarRange,
  Calendar,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  Eraser,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, type Gestion, type GestionSummary } from "@/lib/api";
import { usePermissions } from "@/lib/usePermissions";

export default function GestionesManagementPage() {
  const { isLoading: isAuthLoading, canManageGestiones } = usePermissions();

  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [summaries, setSummaries] = useState<Record<number, GestionSummary>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "upcoming" | "past">("all");

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGestion, setEditingGestion] = useState<Gestion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
  });

  // Clear activities modal state
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [selectedGestionForClear, setSelectedGestionForClear] = useState<Gestion | null>(null);
  const [confirmNameInput, setConfirmNameInput] = useState("");
  const [isClearing, setIsClearing] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGestionForDelete, setSelectedGestionForDelete] = useState<Gestion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch gestiones
  const loadGestiones = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.gestiones.list();
      setGestiones(data);

      // Fetch summaries for each gestion in parallel
      const summaryPromises = data.map((g) =>
        api.gestiones.summary(g.id).catch(() => null)
      );
      const results = await Promise.all(summaryPromises);
      const map: Record<number, GestionSummary> = {};
      results.forEach((s) => {
        if (s) map[s.gestion_id] = s;
      });
      setSummaries(map);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "No se pudieron cargar las gestiones académicas."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canManageGestiones) {
      loadGestiones();
    }
  }, [canManageGestiones, loadGestiones]);

  // Determine status of a gestion relative to today
  const getGestionStatus = (startDateStr: string, endDateStr: string) => {
    const today = new Date().toISOString().split("T")[0];
    if (today >= startDateStr && today <= endDateStr) {
      return { label: "Vigente", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30", type: "active" };
    }
    if (today < startDateStr) {
      return { label: "Próxima", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30", type: "upcoming" };
    }
    return { label: "Concluida", color: "bg-muted text-muted-foreground border-border", type: "past" };
  };

  // Filtered gestiones list
  const filteredGestiones = useMemo(() => {
    return gestiones.filter((g) => {
      const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      if (!matchesSearch) return false;

      if (statusFilter === "all") return true;
      const status = getGestionStatus(g.start_date, g.end_date);
      return status.type === statusFilter;
    });
  }, [gestiones, searchQuery, statusFilter]);

  // Handle open create modal
  const openCreateModal = () => {
    setEditingGestion(null);
    setFormData({
      name: "",
      start_date: "",
      end_date: "",
    });
    setIsModalOpen(true);
  };

  // Handle open edit modal
  const openEditModal = (g: Gestion) => {
    setEditingGestion(g);
    setFormData({
      name: g.name,
      start_date: g.start_date,
      end_date: g.end_date,
    });
    setIsModalOpen(true);
  };

  // Submit create or edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("El nombre de la gestión es obligatorio.");
      return;
    }
    const semesterPattern = /^[12]-\d{4}$/;
    if (!semesterPattern.test(formData.name.trim())) {
      toast.error("El formato debe ser N-AAAA (ej. 1-2026 o 2-2026).");
      return;
    }
    if (!formData.start_date || !formData.end_date) {
      toast.error("Las fechas de inicio y fin son obligatorias.");
      return;
    }
    if (formData.start_date >= formData.end_date) {
      toast.error("La fecha de inicio debe ser anterior a la fecha de fin.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingGestion) {
        await api.gestiones.update(editingGestion.id, {
          name: formData.name.trim(),
          start_date: formData.start_date,
          end_date: formData.end_date,
        });
        toast.success(`Gestión ${formData.name} actualizada correctamente.`);
      } else {
        await api.gestiones.create({
          name: formData.name.trim(),
          start_date: formData.start_date,
          end_date: formData.end_date,
        });
        toast.success(`Gestión ${formData.name} creada correctamente.`);
      }
      setIsModalOpen(false);
      loadGestiones();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail || "Ocurrió un error al guardar la gestión."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle clear activities
  const handleClearActivities = async () => {
    if (!selectedGestionForClear) return;
    if (confirmNameInput.trim() !== selectedGestionForClear.name) {
      toast.error(`Escribí exactamente '${selectedGestionForClear.name}' para confirmar.`);
      return;
    }

    setIsClearing(true);
    try {
      const res = await api.gestiones.clearActivities(selectedGestionForClear.id);
      toast.success(
        `Se eliminaron ${res.total_deleted} actividades de la gestión ${selectedGestionForClear.name}.`
      );
      setIsClearModalOpen(false);
      setSelectedGestionForClear(null);
      setConfirmNameInput("");
      loadGestiones();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail || "Error al vaciar actividades de la gestión."
      );
    } finally {
      setIsClearing(false);
    }
  };

  // Handle delete gestion
  const handleDeleteGestion = async () => {
    if (!selectedGestionForDelete) return;

    setIsDeleting(true);
    try {
      await api.gestiones.delete(selectedGestionForDelete.id);
      toast.success(`Gestión ${selectedGestionForDelete.name} eliminada.`);
      setIsDeleteModalOpen(false);
      setSelectedGestionForDelete(null);
      loadGestiones();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail || "No se pudo eliminar la gestión."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary/60" />
      </div>
    );
  }

  if (!canManageGestiones) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Acceso Restringido</h1>
        <p className="text-muted-foreground text-sm">
          No contás con los permisos requeridos para gestionar los períodos y gestiones académicas institucionales.
        </p>
      </div>
    );
  }

  // Summary counts
  const totalGestiones = gestiones.length;
  const currentActiveGestion = gestiones.find(
    (g) => getGestionStatus(g.start_date, g.end_date).type === "active"
  );
  const totalActivitiesCount = Object.values(summaries).reduce(
    (acc, curr) => acc + (curr.total_activities || 0),
    0
  );

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Page Header */}
      <PageHeader
        title="Gestiones y Semestres Académicos"
        description="Administrá las gestiones oficiales, sus fechas de vigencia y el ciclo de actividades asociadas."
        actions={
          <Button onClick={openCreateModal} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            Nueva Gestión
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-border bg-surface shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CalendarRange className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Gestiones</p>
              <p className="text-xl font-bold text-foreground">{totalGestiones}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-surface shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Gestión Vigente Hoy</p>
              <p className="text-xl font-bold text-foreground">
                {currentActiveGestion ? currentActiveGestion.name : <span className="text-muted-foreground text-sm font-normal">Ninguna en curso</span>}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border bg-surface shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Actividades Registradas</p>
              <p className="text-xl font-bold text-foreground">{totalActivitiesCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por semestre (ej. 1-2026)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-input text-foreground text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium mr-1">Estado:</span>
          {(
            [
              { id: "all", label: "Todas" },
              { id: "active", label: "Vigentes" },
              { id: "upcoming", label: "Próximas" },
              { id: "past", label: "Concluidas" },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                statusFilter === filter.id
                  ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                  : "bg-surface border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gestiones Table Card */}
      <Card className="overflow-hidden border-border bg-surface shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm">Cargando gestiones académicas...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={loadGestiones}>
              Reintentar
            </Button>
          </div>
        ) : filteredGestiones.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <CalendarRange className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <p className="text-sm font-medium text-foreground">No se encontraron gestiones</p>
            <p className="text-xs text-muted-foreground">
              {searchQuery ? "Probá con otro término de búsqueda." : "Comenzá creando la primera gestión académica."}
            </p>
            {!searchQuery && (
              <Button size="sm" onClick={openCreateModal} className="gap-1.5 mt-2">
                <Plus className="w-3.5 h-3.5" />
                Crear Gestión
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground">Gestión</TableHead>
                  <TableHead className="font-semibold text-foreground">Estado</TableHead>
                  <TableHead className="font-semibold text-foreground">Fecha Inicio</TableHead>
                  <TableHead className="font-semibold text-foreground">Fecha Fin</TableHead>
                  <TableHead className="font-semibold text-foreground">Actividades</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGestiones.map((gestion) => {
                  const status = getGestionStatus(gestion.start_date, gestion.end_date);
                  const summary = summaries[gestion.id];
                  const totalActs = summary ? summary.total_activities : 0;

                  return (
                    <TableRow key={gestion.id} className="border-border hover:bg-muted/40 transition-colors">
                      <TableCell className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-base tracking-tight">{gestion.name}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className={`text-xs px-2.5 py-0.5 rounded-full border ${status.color}`}>
                          {status.label}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-sm text-foreground font-medium">
                        {gestion.start_date}
                      </TableCell>

                      <TableCell className="text-sm text-foreground font-medium">
                        {gestion.end_date}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs bg-muted text-foreground border-border font-mono">
                            {totalActs} {totalActs === 1 ? "actividad" : "actividades"}
                          </Badge>
                          {summary && totalActs > 0 && (
                            <span className="text-[11px] text-muted-foreground">
                              ({summary.academic_count} acad. / {summary.scientific_count} cient.)
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(gestion)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="Editar gestión"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          {/* Clear activities button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedGestionForClear(gestion);
                              setConfirmNameInput("");
                              setIsClearModalOpen(true);
                            }}
                            className="h-8 w-8 text-amber-500/80 hover:text-amber-600 hover:bg-amber-500/10"
                            title="Vaciar actividades de esta gestión"
                          >
                            <Eraser className="w-4 h-4" />
                          </Button>

                          {/* Delete gestion button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedGestionForDelete(gestion);
                              setIsDeleteModalOpen(true);
                            }}
                            className="h-8 w-8 text-red-500/80 hover:text-red-600 hover:bg-red-500/10"
                            title="Eliminar gestión"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                  <CalendarRange className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-foreground">
                  {editingGestion ? `Editar Gestión ${editingGestion.name}` : "Nueva Gestión Académica"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Nombre de la Gestión <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. 1-2026 o 2-2026"
                  className="bg-background border-input text-foreground font-mono"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Formato obligatorio semestral: <span className="font-semibold">N-AAAA</span> (ej. 1-2026, 2-2026).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Fecha de Inicio <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="bg-background border-input text-foreground"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Fecha de Fin <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="bg-background border-input text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5">
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingGestion ? "Guardar Cambios" : "Crear Gestión"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLEAR ACTIVITIES MODAL */}
      {isClearModalOpen && selectedGestionForClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-surface p-6 shadow-2xl dark:border-amber-500/30 dark:bg-slate-900 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                <Eraser className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Vaciar Actividades de Gestión
                </h2>
                <p className="text-xs text-muted-foreground">Acción irreversible de reinicio</p>
              </div>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-sm text-foreground">
                Estás a punto de eliminar <span className="font-bold text-red-500">todas</span> las actividades académicas y científicas registradas para la gestión{" "}
                <span className="font-bold font-mono text-primary">{selectedGestionForClear.name}</span>.
              </p>

              {summaries[selectedGestionForClear.id] && (
                <div className="p-3 rounded-xl bg-muted/60 border border-border text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Actividades académicas a borrar:</span>
                    <span className="font-bold text-foreground">{summaries[selectedGestionForClear.id].academic_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Actividades científicas a borrar:</span>
                    <span className="font-bold text-foreground">{summaries[selectedGestionForClear.id].scientific_count}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-border font-semibold">
                    <span>Total a eliminar:</span>
                    <span className="text-red-500 font-bold">{summaries[selectedGestionForClear.id].total_activities}</span>
                  </div>
                </div>
              )}

              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-foreground">
                  Para confirmar, escribí el nombre exacto de la gestión (<span className="font-mono text-primary">{selectedGestionForClear.name}</span>):
                </label>
                <Input
                  value={confirmNameInput}
                  onChange={(e) => setConfirmNameInput(e.target.value)}
                  placeholder={selectedGestionForClear.name}
                  className="bg-background border-input font-mono"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsClearModalOpen(false);
                  setSelectedGestionForClear(null);
                  setConfirmNameInput("");
                }}
                disabled={isClearing}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleClearActivities}
                disabled={isClearing || confirmNameInput.trim() !== selectedGestionForClear.name}
                className="gap-1.5"
              >
                {isClearing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirmar y Vaciar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE GESTION MODAL */}
      {isDeleteModalOpen && selectedGestionForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-surface p-6 shadow-2xl dark:border-red-500/30 dark:bg-slate-900 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Eliminar Gestión {selectedGestionForDelete.name}
                </h2>
                <p className="text-xs text-muted-foreground">Eliminación del período académico</p>
              </div>
            </div>

            <div className="py-4 space-y-3">
              {summaries[selectedGestionForDelete.id]?.total_activities > 0 ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-600 dark:text-amber-400 space-y-1.5">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    No se puede eliminar directamente
                  </p>
                  <p>
                    Esta gestión contiene{" "}
                    <span className="font-bold">{summaries[selectedGestionForDelete.id].total_activities}</span> actividades
                    asociadas. Para evitar pérdidas accidentales, debés vaciar primero sus actividades antes de eliminar la gestión.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-foreground">
                  ¿Estás seguro de que deseás eliminar permanentemente la gestión{" "}
                  <span className="font-bold font-mono text-primary">{selectedGestionForDelete.name}</span>?
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedGestionForDelete(null);
                }}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDeleteGestion}
                disabled={isDeleting || (summaries[selectedGestionForDelete.id]?.total_activities || 0) > 0}
                className="gap-1.5"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Eliminar Gestión
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
