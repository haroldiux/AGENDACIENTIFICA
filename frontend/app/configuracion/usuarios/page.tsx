"use client";

import React, { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Users,
  Plus,
  FileUp,
  Download,
  Search,
  Pencil,
  X,
  Loader2,
  Power,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  KeyRound,
  Building2,
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
import {
  api,
  type UserResponseItem,
  type RoleEnum,
  type Career,
  type UserImportReport,
} from "@/lib/api";
import { useUser } from "@/context/AuthContext";

const ADMIN_ROLES: RoleEnum[] = [
  "super_admin",
  "admin",
  "vicerrectorado",
  "director_investigacion",
];

const ROLE_LABELS: Record<RoleEnum, string> = {
  super_admin: "Super Admin",
  admin: "Administrador",
  vicerrectorado: "Vicerrectorado",
  director_investigacion: "Director de Investigación",
  jefe_investigacion: "Jefe de Investigación",
  coordinator: "Coordinador",
  research: "Investigador",
  teacher: "Docente",
  read_only: "Solo Lectura",
};

const ROLE_BADGE_STYLES: Record<RoleEnum, string> = {
  super_admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300",
  admin: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300",
  vicerrectorado: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-300",
  director_investigacion: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300",
  jefe_investigacion: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 border-teal-300",
  coordinator: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300",
  research: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-300",
  teacher: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300",
  read_only: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-300",
};

export default function UserManagementPage() {
  const { user: currentUser, isLoading: isAuthLoading } = useUser();
  const canManage = currentUser ? ADMIN_ROLES.includes(currentUser.role as RoleEnum) : false;

  const [users, setUsers] = useState<UserResponseItem[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedCareer, setSelectedCareer] = useState<string>("");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponseItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importReport, setImportReport] = useState<UserImportReport | null>(null);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone_number: "",
    telegram_chat_id: "",
    role: "teacher" as RoleEnum,
    career_ids: [] as number[],
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    email: "",
    full_name: "",
    phone_number: "",
    telegram_chat_id: "",
    role: "teacher" as RoleEnum,
    is_active: true,
    career_ids: [] as number[],
    password: "",
  });

  // Load careers
  useEffect(() => {
    api.careers
      .list()
      .then((data) => setCareers(data))
      .catch((err) => console.error("Error loading careers:", err));
  }, []);

  // Load Users
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.users.list({
        page,
        page_size: pageSize,
        search: searchQuery || undefined,
        role: selectedRole || undefined,
        career_id: selectedCareer ? parseInt(selectedCareer, 10) : undefined,
      });
      setUsers(data.items);
      setTotalPages(data.pages);
      setTotalUsers(data.total);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar la lista de usuarios."
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, searchQuery, selectedRole, selectedCareer]);

  useEffect(() => {
    if (canManage) {
      loadUsers();
    }
  }, [canManage, loadUsers]);

  // Handle User Status Toggle
  const handleToggleStatus = async (user: UserResponseItem) => {
    setTogglingId(user.id);
    const newStatus = !user.is_active;
    try {
      await api.users.update(user.id, { is_active: newStatus });
      toast.success(
        `Usuario ${user.email} ${newStatus ? "activado" : "desactivado"} correctamente`
      );
      loadUsers();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al cambiar el estado"
      );
    } finally {
      setTogglingId(null);
    }
  };

  // Create User Submission
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.email || !createForm.password) {
      toast.error("El email y la contraseña son obligatorios");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.users.create({
        email: createForm.email,
        password: createForm.password,
        full_name: createForm.full_name || undefined,
        phone_number: createForm.phone_number || undefined,
        telegram_chat_id: createForm.telegram_chat_id || undefined,
        role: createForm.role,
        career_ids: createForm.career_ids,
      });
      toast.success("Usuario creado exitosamente");
      setIsCreateModalOpen(false);
      setCreateForm({
        email: "",
        password: "",
        full_name: "",
        phone_number: "",
        telegram_chat_id: "",
        role: "teacher",
        career_ids: [],
      });
      loadUsers();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al crear el usuario"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit User Modal open
  const openEditModal = (userItem: UserResponseItem) => {
    setEditingUser(userItem);
    setEditForm({
      email: userItem.email,
      full_name: userItem.full_name || "",
      phone_number: userItem.phone_number || "",
      telegram_chat_id: userItem.telegram_chat_id || "",
      role: userItem.role,
      is_active: userItem.is_active,
      career_ids: userItem.careers.map((c) => c.id),
      password: "",
    });
    setIsEditModalOpen(true);
  };

  // Edit User Submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      await api.users.update(editingUser.id, {
        email: editForm.email,
        full_name: editForm.full_name || undefined,
        phone_number: editForm.phone_number || undefined,
        telegram_chat_id: editForm.telegram_chat_id || undefined,
        role: editForm.role,
        is_active: editForm.is_active,
        career_ids: editForm.career_ids,
        password: editForm.password ? editForm.password : undefined,
      });
      toast.success("Usuario actualizado correctamente");
      setIsEditModalOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al actualizar el usuario"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Excel Import Submission
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
      toast.error("Seleccione un archivo Excel (.xlsx)");
      return;
    }
    setIsSubmitting(true);
    setImportReport(null);
    try {
      const report = await api.users.importExcel(importFile);
      setImportReport(report);
      if (report.success_count > 0) {
        toast.success(`Se importaron ${report.success_count} usuarios correctamente`);
        loadUsers();
      } else {
        toast.error("No se pudo importar ningún usuario. Verifique el informe.");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al procesar el archivo Excel"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Acceso Restringido</h2>
        <p className="text-muted-foreground mb-4">
          No tiene permisos suficientes para administrar los usuarios del sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <PageHeader
        title="Gestión de Usuarios"
        description="Administre las cuentas de usuarios, roles, carreras asignadas e importación masiva."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                setImportFile(null);
                setImportReport(null);
                setIsImportModalOpen(true);
              }}
            >
              <FileUp className="w-4 h-4" />
              Importar Excel
            </Button>
            <Button
              className="flex items-center gap-2"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Nuevo Usuario
            </Button>
          </div>
        }
      />

      {/* Filters Bar */}
      <div className="rounded-2xl border border-white/6 bg-slate-900/60 backdrop-blur-sm shadow-lg overflow-hidden p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por email o nombre..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-white/10 rounded-lg text-sm bg-slate-800/60 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:border-primary/50"
            />
          </div>

          <div>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-white/10 rounded-xl text-sm bg-slate-800/60 text-slate-200 focus:outline-none focus:ring-1 focus:border-primary/50"
            >
              <option value="">Todos los Roles</option>
              {Object.entries(ROLE_LABELS).map(([rKey, rLabel]) => (
                <option key={rKey} value={rKey}>
                  {rLabel}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedCareer}
              onChange={(e) => {
                setSelectedCareer(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-white/10 rounded-xl text-sm bg-slate-800/60 text-slate-200 focus:outline-none focus:ring-1 focus:border-primary/50"
            >
              <option value="">Todas las Carreras</option>
              {careers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-white/6 bg-slate-900/60 backdrop-blur-sm shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-destructive">
            <p className="font-semibold mb-2">Error al cargar usuarios</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-base">No se encontraron usuarios</p>
            <p className="text-sm mt-1">Pruebe ajustando los filtros de búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-800/40 border-b border-white/5 text-xs text-slate-500 uppercase tracking-wide">
                <TableRow className="border-b-0 hover:bg-transparent">
                  <TableHead className="text-slate-500">Usuario</TableHead>
                  <TableHead className="text-slate-500">Rol</TableHead>
                  <TableHead className="text-slate-500">Contacto</TableHead>
                  <TableHead className="text-slate-500">Carreras Asignadas</TableHead>
                  <TableHead className="text-center text-slate-500">Estado</TableHead>
                  <TableHead className="text-right text-slate-500">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                    <TableCell className="px-4 py-3 text-sm text-slate-300">
                      <div className="font-medium">{u.full_name || "Sin nombre registrado"}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-slate-300">
                      <Badge variant="outline" className={ROLE_BADGE_STYLES[u.role] || ""}>
                        {ROLE_LABELS[u.role] || u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-slate-400">
                      {u.phone_number && <div>Tel: {u.phone_number}</div>}
                      {u.telegram_chat_id && <div>Telegram: {u.telegram_chat_id}</div>}
                      {!u.phone_number && !u.telegram_chat_id && <span>-</span>}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-slate-300">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {u.careers && u.careers.length > 0 ? (
                          u.careers.map((c) => (
                            <Badge key={c.id} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {c.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Todas (Global)</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-slate-300 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={togglingId === u.id}
                        onClick={() => handleToggleStatus(u)}
                        className="h-8 px-2"
                        title={u.is_active ? "Desactivar usuario" : "Activar usuario"}
                      >
                        {togglingId === u.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : u.is_active ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300">
                            Inactivo
                          </Badge>
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-slate-300 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(u)}
                        className="h-8 w-8 p-0"
                        title="Editar Usuario"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination footer */}
        {totalUsers > 0 && (
          <div className="flex items-center justify-between p-4 border-t text-sm">
            <div className="text-muted-foreground">
              Mostrando {users.length} de {totalUsers} usuarios (Página {page} de {totalPages})
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create User */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-card text-card-foreground rounded-lg border shadow-xl w-full max-w-lg overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-bold">Nuevo Usuario</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsCreateModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="usuario@unitepc.edu.bo"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Contraseña *</label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej. Dr. Juan Pérez"
                  value={createForm.full_name}
                  onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Rol</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as RoleEnum })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  >
                    {Object.entries(ROLE_LABELS).map(([rKey, rLabel]) => (
                      <option
                        key={rKey}
                        value={rKey}
                        disabled={
                          (rKey === "super_admin" && currentUser?.role !== "super_admin") ||
                          (rKey === "admin" && currentUser?.role !== "super_admin" && currentUser?.role !== "admin")
                        }
                      >
                        {rLabel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="+591..."
                    value={createForm.phone_number}
                    onChange={(e) => setCreateForm({ ...createForm, phone_number: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Telegram Chat ID</label>
                <input
                  type="text"
                  placeholder="Ej. 123456789"
                  value={createForm.telegram_chat_id}
                  onChange={(e) => setCreateForm({ ...createForm, telegram_chat_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Carreras Asignadas</label>
                <div className="border rounded-md p-3 max-h-36 overflow-y-auto space-y-2 bg-background">
                  {careers.map((c) => {
                    const checked = createForm.career_ids.includes(c.id);
                    return (
                      <label key={c.id} className="flex items-center gap-2 text-xs cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCreateForm({
                                ...createForm,
                                career_ids: [...createForm.career_ids, c.id],
                              });
                            } else {
                              setCreateForm({
                                ...createForm,
                                career_ids: createForm.career_ids.filter((id) => id !== c.id),
                              });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span>{c.name} ({c.faculty})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Guardando...
                    </>
                  ) : (
                    "Crear Usuario"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-card text-card-foreground rounded-lg border shadow-xl w-full max-w-lg overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-bold">Editar Usuario: {editingUser.email}</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsEditModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Rol</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as RoleEnum })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  >
                    {Object.entries(ROLE_LABELS).map(([rKey, rLabel]) => (
                      <option
                        key={rKey}
                        value={rKey}
                        disabled={
                          (rKey === "super_admin" && currentUser?.role !== "super_admin") ||
                          (rKey === "admin" && currentUser?.role !== "super_admin" && currentUser?.role !== "admin")
                        }
                      >
                        {rLabel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Estado</label>
                  <select
                    value={editForm.is_active ? "true" : "false"}
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === "true" })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={editForm.phone_number}
                    onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Telegram Chat ID</label>
                  <input
                    type="text"
                    value={editForm.telegram_chat_id}
                    onChange={(e) => setEditForm({ ...editForm, telegram_chat_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Nueva Contraseña <span className="font-normal text-muted-foreground">(Dejar en blanco para no cambiar)</span>
                </label>
                <input
                  type="password"
                  placeholder="Nueva contraseña..."
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Carreras Asignadas</label>
                <div className="border rounded-md p-3 max-h-36 overflow-y-auto space-y-2 bg-background">
                  {careers.map((c) => {
                    const checked = editForm.career_ids.includes(c.id);
                    return (
                      <label key={c.id} className="flex items-center gap-2 text-xs cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditForm({
                                ...editForm,
                                career_ids: [...editForm.career_ids, c.id],
                              });
                            } else {
                              setEditForm({
                                ...editForm,
                                career_ids: editForm.career_ids.filter((id) => id !== c.id),
                              });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span>{c.name} ({c.faculty})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Actualizando...
                    </>
                  ) : (
                    "Guardar Cambios"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bulk Excel Import */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-card text-card-foreground rounded-lg border shadow-xl w-full max-w-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-bold">Importación Masiva de Usuarios desde Excel</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsImportModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Template Download Section */}
              <div className="p-4 rounded-lg bg-muted/40 border flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Plantilla de Importación</p>
                  <p className="text-xs text-muted-foreground">
                    Descargue el formato .xlsx con las columnas requeridas (Email, Nombre, Rol, etc.).
                  </p>
                </div>
                <a
                  href={api.users.getExcelTemplateUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shrink-0"
                >
                  <Download className="w-4 h-4" />
                  Plantilla Excel
                </a>
              </div>

              {/* Upload Form */}
              <form onSubmit={handleImportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-2">
                    Seleccionar Archivo Excel (.xlsx)
                  </label>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 border rounded-md cursor-pointer"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsImportModalOpen(false)}
                  >
                    Cerrar
                  </Button>
                  <Button type="submit" disabled={!importFile || isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Procesando...
                      </>
                    ) : (
                      "Procesar Importación"
                    )}
                  </Button>
                </div>
              </form>

              {/* Report Display */}
              {importReport && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-bold text-sm">Resultado de la Importación</h4>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-lg border bg-muted/20">
                      <p className="text-xs text-muted-foreground">Total Filas</p>
                      <p className="text-xl font-bold">{importReport.total_rows}</p>
                    </div>
                    <div className="p-3 rounded-lg border bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300">
                      <p className="text-xs font-semibold">Exitosos</p>
                      <p className="text-xl font-bold">{importReport.success_count}</p>
                    </div>
                    <div className="p-3 rounded-lg border bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-200 border-red-300">
                      <p className="text-xs font-semibold">Errores</p>
                      <p className="text-xl font-bold">{importReport.error_count}</p>
                    </div>
                  </div>

                  {importReport.row_errors.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-destructive">Detalle de Errores por Fila:</p>
                      <div className="max-h-48 overflow-y-auto border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-16">Fila</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Error</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {importReport.row_errors.map((errItem, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-mono text-xs">{errItem.row}</TableCell>
                                <TableCell className="text-xs">{errItem.email || "-"}</TableCell>
                                <TableCell className="text-xs text-destructive">{errItem.error}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
