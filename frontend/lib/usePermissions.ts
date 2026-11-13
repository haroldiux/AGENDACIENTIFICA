"use client";

import { useUser } from "@/context/AuthContext";
import { type RoleEnum } from "./api";

export const GLOBAL_ROLES: RoleEnum[] = [
  "super_admin",
  "admin",
  "vicerrectorado",
];

export const SEDE_ROLES: RoleEnum[] = [
  "vicerrector_sede",
  "director_academico_sede",
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
  "vicerrector_sede",
  "research",
];

export const READ_ONLY_ROLES: RoleEnum[] = ["read_only"];

export const ROLE_LABELS: Record<RoleEnum, string> = {
  super_admin: "Super Administrador",
  admin: "Administrador",
  vicerrectorado: "Vicerrector Académico Nacional",
  vicerrector_sede: "Vicerrector de Sede",
  director_academico_sede: "Director Académico de Sede",
  director_investigacion: "Director de Investigación",
  jefe_investigacion: "Jefe de Investigación",
  coordinator: "Director de Carrera",
  research: "Investigador",
  teacher: "Docente",
  read_only: "Solo Lectura",
};

export function usePermissions() {
  const { user, isLoading } = useUser();

  const role = user?.role as RoleEnum | undefined;

  const isGlobalRole = !!role && GLOBAL_ROLES.includes(role);
  const isSedeRole = !!role && SEDE_ROLES.includes(role);
  const isReadOnly = !!role && READ_ONLY_ROLES.includes(role);
  const canManageUsers = !!role && USER_ADMIN_ROLES.includes(role);
  const canManageCategories = !!role && CATEGORY_MANAGER_ROLES.includes(role);

  const canCreatePilar = (pilar: string) => {
    if (!role || isReadOnly) return false;
    const p = pilar.toLowerCase();
    if (role === "director_academico_sede") return p === "academica";
    if (role === "jefe_investigacion") return p === "investigacion";
    return true;
  };

  const allowedPilares = (() => {
    if (role === "director_academico_sede") return ["academica"];
    if (role === "jefe_investigacion") return ["investigacion"];
    return ["academica", "investigacion", "interaccion_social", "internacionalizacion"];
  })();

  const canManageActivity = (activity: { career_id?: number | null; sede_id?: number | null; pilar?: string | null }) => {
    if (!user || isReadOnly) return false;
    if (isGlobalRole) return true;

    // Check pillar constraint
    if (activity.pilar && !canCreatePilar(activity.pilar)) return false;

    // Sede-level authority
    if (isSedeRole) {
      if (user.sede_id && activity.sede_id && user.sede_id !== activity.sede_id) {
        return false;
      }
      return true;
    }

    if (activity.career_id == null) return false;
    return user.careers.some((c) => c.id === activity.career_id);
  };

  return {
    user,
    isLoading,
    role,
    isGlobalRole,
    isSedeRole,
    isReadOnly,
    canManageUsers,
    canManageCategories,
    canManageActivity,
    canCreatePilar,
    allowedPilares,
  };
}
