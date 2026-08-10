"use client";

import React, { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Plus,
  Pencil,
  Search,
  X,
  Loader2,
  Tag,
  Power,
  ShieldAlert,
  Palette,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, type ActivityCategory } from "@/lib/api";
import { useUser } from "@/context/AuthContext";

const ALLOWED_ROLES = [
  "vicerrectorado",
  "admin",
  "super_admin",
  "director_investigacion",
  "research",
];

export default function CategoryManagementPage() {
  const { user, isLoading: isAuthLoading } = useUser();
  const canManage = user ? ALLOWED_ROLES.includes(user.role) : false;

  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState<string>("");
  const [includeInactive, setIncludeInactive] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ActivityCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    scope: "academic" | "scientific" | "both";
    color: string;
    description: string;
    is_active: boolean;
  }>({
    name: "",
    code: "",
    scope: "both",
    color: "#3B82F6",
    description: "",
    is_active: true,
  });

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.categories.list(
        scopeFilter || undefined,
        includeInactive
      );
      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las categorías. Intente de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  }, [scopeFilter, includeInactive]);

  useEffect(() => {
    if (canManage) {
      loadCategories();
    }
  }, [canManage, loadCategories]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      code: "",
      scope: "both",
      color: "#3B82F6",
      description: "",
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: ActivityCategory) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      code: cat.code,
      scope: cat.scope,
      color: cat.color || "#3B82F6",
      description: cat.description || "",
      is_active: cat.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error("El nombre y código son obligatorios");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        scope: formData.scope,
        color: formData.color || null,
        description: formData.description.trim() || null,
        is_active: formData.is_active,
      };

      if (editingCategory) {
        await api.categories.update(editingCategory.id, payload);
        toast.success("Categoría actualizada con éxito");
      } else {
        await api.categories.create(payload);
        toast.success("Categoría creada con éxito");
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null;
      toast.error(msg || "Error al guardar la categoría");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (cat: ActivityCategory) => {
    setTogglingId(cat.id);
    try {
      if (cat.is_active) {
        await api.categories.delete(cat.id);
        toast.success(`Categoría "${cat.name}" desactivada`);
      } else {
        await api.categories.update(cat.id, { is_active: true });
        toast.success(`Categoría "${cat.name}" activada`);
      }
      loadCategories();
    } catch {
      toast.error("No se pudo cambiar el estado de la categoría");
    } finally {
      setTogglingId(null);
    }
  };

  const visibleCategories = categories.filter((cat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      cat.name.toLowerCase().includes(q) ||
      cat.code.toLowerCase().includes(q) ||
      (cat.description ?? "").toLowerCase().includes(q)
    );
  });

  const getScopeBadge = (scope: string) => {
    switch (scope) {
      case "academic":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Académico</Badge>;
      case "scientific":
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Científico</Badge>;
      default:
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Ambos</Badge>;
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="space-y-6">
        <Toaster position="top-right" />
        <PageHeader
          title="Administración de Categorías"
          description="Gestión centralizada de categorías y tipos de actividad."
        />
        <Card className="p-8 text-center border-destructive/20 bg-destructive/5">
          <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-3" />
          <h3 className="text-lg font-bold text-destructive mb-1">Acceso Restringido</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            No tienes permisos suficientes para administrar categorías. Esta función está reservada para Vicerrectorado, Dirección Académica y Administradores.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <PageHeader
        title="Administración de Categorías"
        description="Crea, edita, personaliza colores y gestiona la visibilidad de categorías para las actividades."
        actions={
          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nueva Categoría
          </Button>
        }
      />

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, código o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-slate-800/60 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:border-primary/50 text-slate-100 placeholder:text-slate-500"
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

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-400">Ámbito:</label>
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="bg-slate-800/60 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:border-primary/50"
            >
              <option value="">Todos los ámbitos</option>
              <option value="both">Ambos</option>
              <option value="academic">Académico</option>
              <option value="scientific">Científico</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="rounded border-input text-primary focus:ring-primary w-4 h-4"
            />
            Incluir inactivas
          </label>
        </div>
      </div>

      {/* Categories Table */}
      <div className="rounded-2xl border border-white/6 bg-slate-900/60 backdrop-blur-sm shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive text-sm">{error}</p>
            <Button variant="outline" onClick={loadCategories} className="mt-4">
              Reintentar
            </Button>
          </div>
        ) : visibleCategories.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">
              No se encontraron categorías con los criterios de búsqueda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-800/40 border-b border-white/5 text-xs text-slate-500 uppercase tracking-wide">
                <TableRow className="border-b-0 hover:bg-transparent">
                  <TableHead className="text-slate-500 w-[80px]">Color</TableHead>
                  <TableHead className="text-slate-500">Nombre</TableHead>
                  <TableHead className="text-slate-500">Código</TableHead>
                  <TableHead className="text-slate-500">Ámbito</TableHead>
                  <TableHead className="text-slate-500">Descripción</TableHead>
                  <TableHead className="text-slate-500">Estado</TableHead>
                  <TableHead className="text-slate-500 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleCategories.map((cat) => (
                  <TableRow key={cat.id} className={`border-b border-white/4 hover:bg-white/3 transition-colors ${!cat.is_active ? "opacity-60 bg-slate-800/20" : ""}`}>
                    <TableCell className="px-4 py-3 text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-5 h-5 rounded-lg border border-white/10 inline-block shadow-sm"
                          style={{ backgroundColor: cat.color || "#3B82F6" }}
                          title={cat.color || "#3B82F6"}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm font-semibold text-slate-200">{cat.name}</TableCell>
                    <TableCell className="px-4 py-3 text-sm text-slate-300">
                      <Badge variant="outline" className="font-mono text-xs">
                        {cat.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-slate-300">{getScopeBadge(cat.scope)}</TableCell>
                    <TableCell className="px-4 py-3 text-sm text-slate-400 max-w-xs truncate">
                      {cat.description || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-slate-300">
                      {cat.is_active ? (
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                          Activa
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-500/10 text-slate-400 border-slate-500/20">
                          Inactiva
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-slate-300 text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(cat)}
                        className="text-slate-400 hover:text-slate-200 mr-1"
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(cat)}
                        disabled={togglingId === cat.id}
                        className={
                          cat.is_active
                            ? "text-muted-foreground hover:text-destructive"
                            : "text-muted-foreground hover:text-emerald-500"
                        }
                      >
                        {togglingId === cat.id ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                        ) : (
                          <Power className="w-3.5 h-3.5 mr-1" />
                        )}
                        {cat.is_active ? "Desactivar" : "Activar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Category Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="rounded-2xl border border-white/6 bg-slate-900/90 backdrop-blur-md shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Nombre de Categoría *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Simposio Internacional"
                  required
                  className="w-full p-2 bg-slate-800/60 border border-white/10 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Código Único *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                  }
                  placeholder="Ej: SIMPOSIO"
                  required
                  className="w-full p-2 bg-slate-800/60 border border-white/10 rounded-lg text-sm font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:border-primary/50 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Ámbito</label>
                  <select
                    value={formData.scope}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        scope: e.target.value as "academic" | "scientific" | "both",
                      }))
                    }
                    className="w-full p-2 bg-slate-800/60 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-1 focus:border-primary/50"
                  >
                    <option value="both">Ambos (Académico / Científico)</option>
                    <option value="academic">Académico</option>
                    <option value="scientific">Científico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5 text-primary" />
                    Color Identificador
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                      className="w-9 h-9 rounded cursor-pointer border border-white/10 bg-transparent p-0.5"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                      placeholder="#3B82F6"
                      className="flex-1 p-2 bg-slate-800/60 border border-white/10 rounded-lg text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:border-primary/50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Descripción (Opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Detalles adicionales sobre los eventos clasificados bajo esta categoría..."
                  rows={3}
                  className="w-full p-2 bg-slate-800/60 border border-white/10 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:border-primary/50 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="cat_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="cat_is_active" className="text-xs font-medium text-foreground cursor-pointer">
                  Categoría Activa (Visible en selección de actividades)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Categoría"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
