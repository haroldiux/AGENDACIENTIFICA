"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Upload, Trash2, Pencil, Loader2, Search, X, ChevronUp, ChevronDown } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import ActivityModal from "./components/ActivityModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { useUser } from "@/context/AuthContext";

type SortKey = "nombre" | "fecha" | "tipo" | "carrera" | "estado";

const GLOBAL_ROLES = ["super_admin", "admin", "vicerrectorado", "director_investigacion"];
const READ_ONLY_ROLES = ["read_only"];

function isReadOnlyUser(user: { role: string } | null): boolean {
  return !!user && READ_ONLY_ROLES.includes(user.role);
}

function canManageActivity(
  user: { role: string; careers: { id: number }[] } | null,
  activity: ScientificActivity
): boolean {
  if (!user) return false;
  if (isReadOnlyUser(user)) return false;
  if (GLOBAL_ROLES.includes(user.role)) return true;
  if (activity.career_id == null) return false;
  return user.careers.some((c) => c.id === activity.career_id);
}

export default function ActividadesPage() {
  const { user } = useUser();
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
  const [searchQuery, setSearchQuery] = useState("");

  // Sort state — default: fecha ASC
  const [sortState, setSortState] = useState<{ col: SortKey; dir: "asc" | "desc" }>({
    col: "fecha",
    dir: "asc",
  });

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

  const careerName = (id?: number | null) =>
    id ? (careers.find((c) => c.id === id)?.name ?? `#${id}`) : "Global / Vicerrectorado";

  // Sort handler
  const handleSort = (col: SortKey) => {
    setSortState((prev) =>
      prev.col === col
        ? { col, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { col, dir: "asc" }
    );
  };

  // Comparator
  const sortedActivities = [...activities]
    .filter((a) => {
      // 1. Role-based visibility filtering
      if (!user) return false;
      if (GLOBAL_ROLES.includes(user.role) || isReadOnlyUser(user)) return true;
      
      const userCareerIds = user.careers.map(c => c.id);
      const isGlobalActivity = a.career_id === null || a.career_id === undefined;
      const isOwner = a.career_id != null && userCareerIds.includes(a.career_id);
      const isCollaborator = a.collaboration_career_ids?.some(id => userCareerIds.includes(id)) ?? false;
      
      return isOwner || isCollaborator || isGlobalActivity;
    })
    .filter((a) => !statusFilter || a.status === statusFilter)
    .filter((a) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        (a.responsible_name ?? "").toLowerCase().includes(q) ||
        a.activity_type.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let cmp = 0;
      switch (sortState.col) {
        case "nombre":
          cmp = a.title.localeCompare(b.title);
          break;
        case "fecha":
          cmp = a.start_date.localeCompare(b.start_date);
          break;
        case "tipo":
          cmp = a.activity_type.localeCompare(b.activity_type);
          break;
        case "carrera":
          cmp = careerName(a.career_id).localeCompare(careerName(b.career_id));
          break;
        case "estado":
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sortState.dir === "asc" ? cmp : -cmp;
    });

  const visibleActivities = sortedActivities;

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

  // Helper to render sort icon
  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortState.col !== col)
      return <ChevronUp className="w-3 h-3 ml-1 opacity-30 inline-block" />;
    return sortState.dir === "asc" ? (
      <ChevronUp className="w-3 h-3 ml-1 inline-block" />
    ) : (
      <ChevronDown className="w-3 h-3 ml-1 inline-block" />
    );
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <PageHeader
        title="Actividades Científicas"
        description="Crea, edita y da seguimiento a las actividades de investigación por carrera y gestión."
        actions={
          !isReadOnlyUser(user) ? (
            <>
              <Link href="/importar">
                <Button variant="secondary" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Importar Excel
                </Button>
              </Link>
              <Button
                onClick={openCreateModal}
                data-testid="new-activity-button"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nueva Actividad
              </Button>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">Solo lectura</span>
          )
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
        <Card className="p-4 flex flex-col gap-1.5 md:w-56 shadow-sm border-border">
          <label htmlFor="status-select" className="text-xs text-muted-foreground font-medium">
            Estado
          </label>
          <select
            id="status-select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as ScientificActivityStatus | "")
            }
            className="w-full bg-background border border-input rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          >
            <option value="">Todos los estados</option>
            {Object.entries(activityStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Card>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por título, responsable o tipo de actividad..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <Card className="p-0 overflow-hidden border-border shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive text-sm">{error}</p>
            <Button
              variant="outline"
              onClick={loadActivities}
              className="mt-4"
            >
              Reintentar
            </Button>
          </div>
        ) : visibleActivities.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-12">
            No hay actividades con los filtros seleccionados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="w-[300px] cursor-pointer select-none hover:text-foreground"
                    onClick={() => handleSort("nombre")}
                  >
                    Nombre <SortIcon col="nombre" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:text-foreground"
                    onClick={() => handleSort("fecha")}
                  >
                    Fecha <SortIcon col="fecha" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:text-foreground"
                    onClick={() => handleSort("tipo")}
                  >
                    Tipo <SortIcon col="tipo" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:text-foreground"
                    onClick={() => handleSort("carrera")}
                  >
                    Carrera <SortIcon col="carrera" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:text-foreground"
                    onClick={() => handleSort("estado")}
                  >
                    Estado <SortIcon col="estado" />
                  </TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.title}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDateRange(activity.start_date, activity.end_date)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {activityTypeLabels[activity.activity_type] ??
                          activity.activity_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{careerName(activity.career_id)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${activityStatusClasses[activity.status] ?? ""}`}
                      >
                        {activityStatusLabels[activity.status] ?? activity.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {canManageActivity(user, activity) ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(activity)}
                            className="text-muted-foreground hover:text-foreground mr-2"
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(activity)}
                            disabled={deletingId === activity.id}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            {deletingId === activity.id ? (
                              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                            )}
                            Eliminar
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">Solo lectura</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadActivities}
        activity={editingActivity}
      />
    </div>
  );
}
