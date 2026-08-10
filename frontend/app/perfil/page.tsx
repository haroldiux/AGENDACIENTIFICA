"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Save,
  Phone,
  MessageCircle,
  Mail,
  Bell,
  ArrowRight,
  Shield,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Pencil,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const roleLabels: Record<string, string> = {
  super_admin: "Super Administrador",
  admin: "Administrador",
  research: "Investigador",
  coordinator: "Coordinador",
  teacher: "Docente",
  vicerrectorado: "Vicerrectorado",
  director_investigacion: "Director de Investigación",
  jefe_investigacion: "Jefe de Investigación",
  read_only: "Solo Lectura",
};

const roleAccents: Record<string, { pill: string; glow: string; dot: string }> = {
  super_admin:          { pill: "bg-red-500/15 text-red-400 border-red-500/30",       glow: "shadow-red-500/20",    dot: "bg-red-400" },
  admin:                { pill: "bg-orange-500/15 text-orange-400 border-orange-500/30", glow: "shadow-orange-500/20", dot: "bg-orange-400" },
  research:             { pill: "bg-violet-500/15 text-violet-400 border-violet-500/30", glow: "shadow-violet-500/20", dot: "bg-violet-400" },
  coordinator:          { pill: "bg-blue-500/15 text-blue-400 border-blue-500/30",    glow: "shadow-blue-500/20",   dot: "bg-blue-400" },
  teacher:              { pill: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", glow: "shadow-emerald-500/20", dot: "bg-emerald-400" },
  vicerrectorado:       { pill: "bg-amber-500/15 text-amber-400 border-amber-500/30", glow: "shadow-amber-500/20",  dot: "bg-amber-400" },
  director_investigacion: { pill: "bg-purple-500/15 text-purple-400 border-purple-500/30", glow: "shadow-purple-500/20", dot: "bg-purple-400" },
  jefe_investigacion:   { pill: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",    glow: "shadow-cyan-500/20",   dot: "bg-cyan-400" },
  read_only:            { pill: "bg-slate-500/15 text-slate-400 border-slate-500/30", glow: "shadow-slate-500/20",  dot: "bg-slate-400" },
};

export default function ProfilePage() {
  const { user, login } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "" });

  useEffect(() => {
    if (user) setForm({ full_name: user.full_name || "" });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    try {
      const updated = await api.users.updateMe({ full_name: form.full_name || null });
      toast.success("Perfil actualizado correctamente");
      const token = localStorage.getItem("access_token");
      if (token) login(token, updated);
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Ocurrió un error al actualizar el perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary/60" />
      </div>
    );
  }

  const formatRole = (role: string) => roleLabels[role] || role;
  const accent = roleAccents[user.role] ?? roleAccents.read_only;
  const initials = (user.full_name || user.email || "U")
    .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const hasPhone = !!user.phone_number;
  const hasTelegram = !!user.telegram_chat_id;
  const contactComplete = hasPhone && hasTelegram;

  return (
    <div className="max-w-2xl mx-auto space-y-5 py-2">
      <Toaster position="top-right" />

      {/* ══════════════════════════════════════
          HERO CARD — avatar + identity
      ══════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-slate-900 via-slate-800/80 to-slate-900 shadow-2xl">
        {/* decorative background blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className={cn("pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 rounded-full blur-3xl opacity-40", accent.dot.replace("bg-", "bg-"))} style={{ filter: "blur(60px)" }} />

        <div className="relative z-10 flex flex-col items-center gap-4 px-8 py-10 text-center">
          {/* Avatar ring */}
          <div className={cn("relative p-1 rounded-full bg-gradient-to-br from-primary/40 via-primary/10 to-transparent shadow-lg", accent.glow)}>
            <div className="w-24 h-24 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-3xl font-bold text-primary select-none tracking-tight">
              {initials}
            </div>
            {/* online dot */}
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-800 shadow-md" />
          </div>

          {/* Name + email */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {user.full_name || <span className="text-slate-400 italic">Sin nombre</span>}
            </h1>
            <p className="text-sm text-slate-400">{user.email}</p>
          </div>

          {/* Role pill */}
          <Badge
            variant="outline"
            className={cn("text-xs font-semibold border px-3 py-1 rounded-full", accent.pill)}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 inline-block", accent.dot)} />
            {formatRole(user.role)}
          </Badge>

          {/* Contact status chips */}
          <div className="flex items-center gap-2 flex-wrap justify-center mt-1">
            <span className={cn("inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border",
              hasPhone ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" : "bg-slate-700/50 text-slate-500 border-slate-600/40"
            )}>
              {hasPhone ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              WhatsApp
            </span>
            <span className={cn("inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border",
              hasTelegram ? "bg-sky-500/10 text-sky-400 border-sky-500/25" : "bg-slate-700/50 text-slate-500 border-slate-600/40"
            )}>
              {hasTelegram ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              Telegram
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/25">
              <CheckCircle2 className="w-3 h-3" />
              Email
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          NAME EDIT SECTION
      ══════════════════════════════════════ */}
      <div className="rounded-2xl border border-white/6 bg-slate-900/60 backdrop-blur-sm shadow-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
              <Pencil className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold text-slate-200">Nombre completo</span>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Editar
            </button>
          )}
        </div>
        <div className="px-5 py-4">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => setForm({ full_name: e.target.value })}
                placeholder="Ej. Juan Pérez"
                autoFocus
                className="flex-1 bg-slate-800/60 border-white/10 focus:border-primary/50 text-slate-100 placeholder:text-slate-500"
              />
              <div className="flex gap-2 shrink-0">
                <Button type="submit" disabled={isLoading} size="sm" className="gap-1.5">
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Guardar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setIsEditing(false); setForm({ full_name: user.full_name || "" }); }}
                  className="text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-slate-300 font-medium">
              {user.full_name || <span className="text-slate-500 italic text-sm">No configurado — hacé clic en Editar</span>}
            </p>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          ACCOUNT DETAILS
      ══════════════════════════════════════ */}
      <div className="rounded-2xl border border-white/6 bg-slate-900/60 backdrop-blur-sm shadow-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-700/60 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-sm font-semibold text-slate-200">Información de Cuenta</span>
          <Badge variant="secondary" className="ml-auto text-[10px] py-0.5 bg-slate-700/60 text-slate-400 border-0">
            Solo lectura
          </Badge>
        </div>

        <div className="divide-y divide-white/5">
          {/* Email */}
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-medium mb-0.5">Correo electrónico</p>
              <p className="text-sm text-slate-200 font-medium truncate">{user.email}</p>
            </div>
          </div>

          {/* Role */}
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-700/60 border border-white/8 flex items-center justify-center shrink-0">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-medium mb-1.5">Rol en el sistema</p>
              <Badge variant="outline" className={cn("text-xs font-semibold border px-2.5 py-0.5 rounded-full", accent.pill)}>
                <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 inline-block", accent.dot)} />
                {formatRole(user.role)}
              </Badge>
            </div>
          </div>

          {/* Careers */}
          <div className="px-5 py-4 flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-medium mb-1.5">Carrera(s) asignada(s)</p>
              <div className="flex flex-wrap gap-1.5">
                {user.careers && user.careers.length > 0 ? (
                  user.careers.map((career) => (
                    <Badge key={career.id} variant="outline" className="text-xs bg-slate-800 border-white/10 text-slate-300">
                      {career.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-slate-500 italic text-xs">Sin carrera asignada</span>
                )}
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="px-5 py-4 flex items-center gap-4">
            <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center shrink-0",
              hasPhone ? "bg-emerald-500/10 border-emerald-500/20" : "bg-slate-700/40 border-white/6"
            )}>
              <Phone className={cn("w-3.5 h-3.5", hasPhone ? "text-emerald-400" : "text-slate-500")} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-medium mb-0.5">Teléfono / WhatsApp</p>
              {hasPhone ? (
                <p className="text-sm text-slate-200 font-mono font-medium">{user.phone_number}</p>
              ) : (
                <span className="text-xs text-slate-500 italic">No configurado</span>
              )}
            </div>
            {!hasPhone && (
              <Link
                href="/configuracion/notificaciones"
                className="text-xs text-primary hover:underline shrink-0"
              >
                Configurar →
              </Link>
            )}
          </div>

          {/* Telegram */}
          <div className="px-5 py-4 flex items-center gap-4">
            <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center shrink-0",
              hasTelegram ? "bg-sky-500/10 border-sky-500/20" : "bg-slate-700/40 border-white/6"
            )}>
              <MessageCircle className={cn("w-3.5 h-3.5", hasTelegram ? "text-sky-400" : "text-slate-500")} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-medium mb-0.5">Telegram Chat ID</p>
              {hasTelegram ? (
                <p className="text-sm text-slate-200 font-mono font-medium">{user.telegram_chat_id}</p>
              ) : (
                <span className="text-xs text-slate-500 italic">No configurado</span>
              )}
            </div>
            {!hasTelegram && (
              <Link
                href="/configuracion/notificaciones"
                className="text-xs text-primary hover:underline shrink-0"
              >
                Configurar →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          NOTIFICATION CTA
      ══════════════════════════════════════ */}
      <Link
        href="/configuracion/notificaciones"
        className={cn(
          "group flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 transition-all duration-200",
          contactComplete
            ? "border-white/6 bg-slate-900/40 hover:bg-slate-800/60"
            : "border-amber-500/25 bg-amber-500/5 hover:bg-amber-500/8"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
            contactComplete ? "bg-primary/15" : "bg-amber-500/15"
          )}>
            <Bell className={cn("w-4 h-4", contactComplete ? "text-primary" : "text-amber-400")} />
          </div>
          <div>
            <p className={cn("text-sm font-semibold", contactComplete ? "text-slate-200" : "text-amber-300")}>
              {contactComplete ? "Preferencias de Notificación" : "Completá tus canales de contacto"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {contactComplete
                ? "Administrá Email, WhatsApp y Telegram"
                : "Te recomendamos activar al menos un canal para recibir alertas"}
            </p>
          </div>
        </div>
        <ArrowRight className={cn("w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5",
          contactComplete ? "text-slate-500" : "text-amber-400"
        )} />
      </Link>
    </div>
  );
}
