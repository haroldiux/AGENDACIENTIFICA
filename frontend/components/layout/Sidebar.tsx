"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  FileUp,
  LayoutDashboard,
  FlaskConical,
  FileBarChart,
  GraduationCap,
  Menu,
  ChevronLeft,
  Moon,
  Sun,
  Tag,
  LogOut,
  User,
  Users,
  Sparkles,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/AuthContext";

const BASE_NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendario", label: "Calendario", icon: Calendar },
  { href: "/actividades", label: "Actividades", icon: FlaskConical },
  { href: "/importar", label: "Importar", icon: FileUp },
  { href: "/reportes", label: "Reportes", icon: FileBarChart },
  { href: "/perfil", label: "Mi Perfil", icon: User },
];

const CATEGORY_ALLOWED_ROLES = [
  "vicerrectorado",
  "admin",
  "super_admin",
  "director_investigacion",
  "research",
];

const USER_ADMIN_ROLES = [
  "vicerrectorado",
  "admin",
  "super_admin",
  "director_investigacion",
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname === "/login") {
    return null;
  }

  const canManageCategories = user ? CATEGORY_ALLOWED_ROLES.includes(user.role) : false;
  const canManageUsers = user ? USER_ADMIN_ROLES.includes(user.role) : false;

  const navItems = [
    BASE_NAV_ITEMS[0],
    BASE_NAV_ITEMS[1],
    BASE_NAV_ITEMS[2],
    ...(canManageCategories
      ? [{ href: "/configuracion/categorias", label: "Categorías", icon: Tag }]
      : []),
    ...(canManageUsers
      ? [{ href: "/configuracion/usuarios", label: "Usuarios", icon: Users }]
      : []),
    { href: "/configuracion/notificaciones", label: "Notificaciones", icon: Bell },
    BASE_NAV_ITEMS[3],
    BASE_NAV_ITEMS[4],
    BASE_NAV_ITEMS[5],
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? "80px" : "256px" }}
      className="bg-slate-950/95 backdrop-blur-md text-card-foreground border-r border-white/5 md:sticky md:top-0 md:h-screen flex flex-col z-20 transition-all duration-300 md:border-b-0 border-b w-full md:w-auto shrink-0"
    >
      <div className={cn("p-4 flex items-center transition-all relative", collapsed ? "flex-col gap-3 px-2 py-3 justify-center" : "justify-between")}>
        {/* Glow behind logo */}
        <div className="absolute top-4 left-4 w-12 h-12 bg-primary/20 blur-xl rounded-full pointer-events-none" />
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap"
              >
                <p className="font-bold tracking-tight leading-tight">UNITEPC</p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Agenda Científica
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex shrink-0"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <nav className="flex-1 flex flex-row md:flex-col gap-2 p-3 overflow-x-auto md:overflow-hidden">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                active
                  ? "bg-primary/15 text-primary border-l-2 border-primary"
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 hidden md:block">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-xl bg-slate-900/40 border border-white/5 overflow-hidden"
            >
              <p className="text-slate-600 uppercase text-[10px] tracking-widest font-bold leading-relaxed whitespace-nowrap mb-1">
                Depto. de Investigación Científica
              </p>
              <p className="text-slate-400 text-xs">
                Calendario académico
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Info Badge & Logout */}
      {user && (
        <div className="p-3 border-t border-white/5 bg-slate-900/40 mt-auto hidden md:flex flex-col gap-2">
          <div className="flex items-center gap-2.5 px-1 py-1">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
            </div>
            {!collapsed && (
              <div className="overflow-hidden min-w-0 flex-1">
                <p className="font-semibold text-xs truncate" title={user.full_name || user.email}>
                  {user.full_name || user.email}
                </p>
                <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium capitalize truncate max-w-full">
                  {user.role.replace(/_/g, " ")}
                </span>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className={cn(
              "w-full flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 font-medium text-xs transition-colors",
              collapsed ? "justify-center px-0" : "justify-start px-2.5"
            )}
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Cerrar Sesión</span>}
          </Button>
        </div>
      )}

      {/* Theme & Onboarding Guide Toggle */}
      <div className={cn("p-3 border-t border-white/5 bg-slate-900/40 hidden md:flex flex-col gap-1 items-center justify-center", !user && "mt-auto")}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.dispatchEvent(new CustomEvent("open-unitepc-onboarding"))}
          className={cn("w-full flex items-center gap-2 text-xs text-primary hover:text-primary hover:bg-primary/10 font-semibold", collapsed ? "justify-center px-0" : "justify-start px-2.5")}
          title="Ver Guía y Tutorial del Sistema"
        >
          <Sparkles className="w-4 h-4 shrink-0 text-primary animate-pulse" />
          {!collapsed && <span>Guía del Sistema</span>}
        </Button>

        {mounted && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn("w-full flex items-center gap-2 text-xs", collapsed ? "justify-center px-0" : "justify-start px-2.5")}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
            {!collapsed && <span>{theme === "dark" ? "Modo Claro" : "Modo Oscuro"}</span>}
          </Button>
        )}
      </div>
    </motion.aside>
  );
}
