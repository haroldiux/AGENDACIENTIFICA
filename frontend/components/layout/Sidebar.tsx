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
  Sun
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendario", label: "Calendario", icon: Calendar },
  { href: "/actividades", label: "Actividades", icon: FlaskConical },
  { href: "/importar", label: "Importar", icon: FileUp },
  { href: "/reportes", label: "Reportes", icon: FileBarChart },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? "80px" : "256px" }}
      className="bg-card text-card-foreground border-r border-border md:min-h-screen flex flex-col z-20 relative transition-all duration-300 md:border-b-0 border-b w-full md:w-auto"
    >
      <div className="p-4 flex items-center justify-between">
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
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative",
                active
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
              className="p-3 rounded-xl bg-muted/50 border border-border overflow-hidden"
            >
              <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-nowrap">
                Depto. de Investigación Científica
                <br />
                <span className="text-foreground/70">Calendario académico</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-border mt-auto hidden md:flex items-center justify-center">
        {mounted && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn("w-full flex items-center gap-2", collapsed ? "justify-center" : "justify-start px-3")}
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {!collapsed && <span>{theme === "dark" ? "Modo Claro" : "Modo Oscuro"}</span>}
          </Button>
        )}
      </div>
    </motion.aside>
  );
}
