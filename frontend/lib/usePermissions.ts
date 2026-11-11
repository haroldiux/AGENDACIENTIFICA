"use client";

import { useUser } from "@/context/AuthContext";
import { type RoleEnum } from "./api";

export const GLOBAL_ROLES: RoleEnum[] = [
  "super_admin",
  "admin",
  "vicerrectorado",
  "director_investigacion",
];

export const USER_ADMIN_ROLES: RoleEnum[] = [
  "super_admin",
  "admin",
];

export const CATEGORY_MANAGER_ROLES: RoleEnum[] = [
  "super_admin",
  "admin",
  "vicerrectorado",
  "director_investigacion",
  "research",
];

export const READ_ONLY_ROLES: RoleEnum[] = ["read_only"];

export const ROLE_LABELS: Record<RoleEnum, string> = {
  super_admin: "Super Administrador",
  admin: "Administrador",
  vicerrectorado: "Vicerrectorado",
  director_investigacion: "Director de Investigación",
  jefe_investigacion: "Jefe de Investigación",
  coordinator: "Coordinador",
  research: "Investigador",
  teacher: "Docente",
  read_only: "Solo Lectura",
};

export function usePermissions() {
  const { user, isLoading } = useUser();

  const role = user?.role as RoleEnum | undefined;

  const isGlobalRole = !!role && GLOBAL_ROLES.includes(role);
  const isReadOnly = !!role && READ_ONLY_ROLES.includes(role);
  const canManageUsers = !!role && USER_ADMIN_ROLES.includes(role);
  const canManageCategories = !!role && CATEGORY_MANAGER_ROLES.includes(role);

  const canManageActivity = (activity: { career_id?: number | null }) => {
    if (!user || isReadOnly) return false;
    if (isGlobalRole) return true;
    if (activity.career_id == null) return false;
    return user.careers.some((c) => c.id === activity.career_id);
  };

  return {
    user,
    isLoading,
    role,
    isGlobalRole,
    isReadOnly,
    canManageUsers,
    canManageCategories,
    canManageActivity,
  };
}
