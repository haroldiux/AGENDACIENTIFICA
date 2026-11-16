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
  CalendarRange,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/AuthContext";
import { usePermissions, ROLE_LABELS } from "@/lib/usePermissions";

const BASE_NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendario", label: "Calendario", icon: Calendar },
  { href: "/actividades", label: "Actividades", icon: FlaskConical },
  { href: "/importar", label: "Importar", icon: FileUp },
  { href: "/reportes", label: "Reportes", icon: FileBarChart },
  { href: "/perfil", label: "Mi Perfil", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useUser();
  const { canManageCategories, canManageUsers, canManageGestiones, role } = usePermissions();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile drawer whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (pathname === "/login") {
    return null;
  }

  const navItems = [
    BASE_NAV_ITEMS[0],
    BASE_NAV_ITEMS[1],
    BASE_NAV_ITEMS[2],
    ...(canManageCategories
      ? [{ href: "/configuracion/categorias", label: "Categorías", icon: Tag }]
      : []),
    ...(canManageGestiones
      ? [{ href: "/configuracion/gestiones", label: "Gestiones", icon: CalendarRange }]
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
    <>
      {/* ── MOBILE TOP BAR (<= md screens) ── */}
      <header className="md:hidden sticky top-0 z-30 w-full bg-surface-sidebar border-b border-border px-4 py-2.5 flex items-center justify-between shadow-sm dark:bg-slate-950/95 dark:backdrop-blur-md dark:border-white/5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <GraduationCap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight text-foreground">UNITEPC</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Agenda Científica</p>
          </div>
        </Link>

        <div className="flex items-center gap-1.5">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              aria-label="Cambiar tema"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="h-9 w-9 text-foreground"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* ── MOBILE SLIDE-OVER DRAWER & BACKDROP ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-surface-sidebar border-r border-border flex flex-col shadow-2xl dark:bg-slate-950 dark:border-white/10 md:hidden"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-border flex items-center justify-between dark:border-white/5">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
                    <GraduationCap className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-bold tracking-tight text-foreground">UNITEPC</p>
                    <p className="text-[11px] text-muted-foreground">Agenda Científica</p>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Drawer Navigation Links */}
              <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                {navItems.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        active
                          ? "bg-primary/15 text-primary border-l-2 border-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-white/5"
                      )}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Department label */}
              <div className="px-3 py-2">
                <div className="p-2.5 rounded-xl bg-muted/60 border border-border text-[11px] dark:bg-slate-900/60 dark:border-white/5">
                  <p className="text-muted-foreground/70 uppercase text-[9px] tracking-wider font-bold mb-0.5">
                    Depto. Investigación Científica
                  </p>
                  <p className="text-muted-foreground text-xs">Calendario Académico y Científico</p>
                </div>
              </div>

              {/* Drawer User Info & Actions */}
              {user && (
                <div className="p-3 border-t border-border bg-muted/30 flex flex-col gap-2 dark:border-white/5">
                  <div className="flex items-center gap-2.5 px-1 py-1">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                      {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
                    </div>
                    <div className="overflow-hidden min-w-0 flex-1">
                      <p className="font-semibold text-xs truncate text-foreground" title={user.full_name || user.email}>
                        {user.full_name || user.email}
                      </p>
                      <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium capitalize truncate max-w-full">
                        {(role && ROLE_LABELS[role]) || user.role.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMobileOpen(false);
                      window.dispatchEvent(new CustomEvent("open-unitepc-onboarding"));
                    }}
                    className="w-full flex items-center justify-start gap-2 text-xs text-primary hover:text-primary hover:bg-primary/10 font-semibold px-2.5"
                  >
                    <Sparkles className="w-4 h-4 shrink-0 text-primary animate-pulse" />
                    <span>Guía del Sistema</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 font-medium text-xs px-2.5"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Cerrar Sesión</span>
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── DESKTOP SIDEBAR (md:flex) ── */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? "80px" : "256px" }}
        className={cn(
          "hidden md:flex border-r border-border md:sticky md:top-0 md:h-screen flex-col z-20",
          "transition-all duration-300 shrink-0",
          "bg-surface-sidebar text-foreground",
          "dark:bg-slate-950/95 dark:backdrop-blur-md dark:border-white/5 dark:text-card-foreground"
        )}
      >
        {/* Header / Logo */}
        <div className={cn("p-4 flex items-center transition-all relative", collapsed ? "flex-col gap-3 px-2 py-3 justify-center" : "justify-between")}>
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
                  <p className="font-bold tracking-tight leading-tight text-foreground">UNITEPC</p>
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
            className="shrink-0"
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
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
                    : "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:text-slate-100 dark:hover:bg-white/5"
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

        {/* Department label */}
        <div className="p-4">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-xl bg-muted border border-border overflow-hidden dark:bg-slate-900/60 dark:border-white/5"
              >
                <p className="text-muted-foreground/60 uppercase text-[10px] tracking-widest font-bold leading-relaxed whitespace-nowrap mb-1">
                  Depto. de Investigación Científica
                </p>
                <p className="text-muted-foreground text-xs">
                  Calendario académico
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Info Badge & Logout */}
        {user && (
          <div className="p-3 border-t border-border bg-muted/40 mt-auto flex flex-col gap-2 dark:border-white/5">
            <div className="flex items-center gap-2.5 px-1 py-1">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
              </div>
              {!collapsed && (
                <div className="overflow-hidden min-w-0 flex-1">
                  <p className="font-semibold text-xs truncate text-foreground" title={user.full_name || user.email}>
                    {user.full_name || user.email}
                  </p>
                  <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium capitalize truncate max-w-full">
                    {(role && ROLE_LABELS[role]) || user.role.replace(/_/g, " ")}
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

        {/* Theme & Onboarding Toggle */}
        <div className={cn("p-3 border-t border-border bg-muted/40 flex flex-col gap-1 items-center justify-center dark:border-white/5", !user && "mt-auto")}>
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
              className={cn("w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground", collapsed ? "justify-center px-0" : "justify-start px-2.5")}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
              {!collapsed && <span>{theme === "dark" ? "Modo Claro" : "Modo Oscuro"}</span>}
            </Button>
          )}
        </div>
      </motion.aside>
    </>
  );
}
