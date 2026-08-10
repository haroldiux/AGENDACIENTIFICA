"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Save,
  Phone,
  MessageCircle,
  Mail,
  User,
  Bell,
  ArrowRight,
  Shield,
  GraduationCap,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const roleColors: Record<string, string> = {
  super_admin: "bg-red-500/15 text-red-400 border-red-500/30",
  admin: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  research: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  coordinator: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  teacher: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  vicerrectorado: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  director_investigacion: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  jefe_investigacion: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  read_only: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

export default function ProfilePage() {
  const { user, login } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ full_name: "" });

  useEffect(() => {
    if (user) {
      setForm({ full_name: user.full_name || "" });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    try {
      const updated = await api.users.updateMe({
        full_name: form.full_name || null,
      });
      toast.success("Perfil actualizado correctamente");
      const token = localStorage.getItem("access_token");
      if (token) login(token, updated);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Ocurrió un error al actualizar el perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const formatRole = (role: string) => roleLabels[role] || role;
  const initials = (user.full_name || user.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2">
      <Toaster position="top-right" />

      {/* ── Avatar + name header ── */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center text-2xl font-bold text-primary select-none">
            {initials}
          </div>
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-background" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {user.full_name || "Sin nombre"}
          </h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Badge
          className={cn(
            "text-xs font-semibold border px-3 py-0.5",
            roleColors[user.role] ?? "bg-muted text-foreground"
          )}
          variant="outline"
        >
          {formatRole(user.role)}
        </Badge>
      </div>

      {/* ── Notification banner ── */}
      <div className="rounded-xl border border-primary/25 bg-primary/5 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/15 text-primary shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-foreground">Centro de Preferencias de Notificación</p>
            <p className="text-xs text-muted-foreground">
              Configurá Email, WhatsApp y Telegram para recibir alertas.
            </p>
          </div>
        </div>
        <Link
          href="/configuracion/notificaciones"
          className={cn(
            buttonVariants({ variant: "default", size: "sm" }),
            "shrink-0 gap-1.5 w-full sm:w-auto justify-center"
          )}
        >
          Administrar
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── Editable name ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Nombre completo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => setForm({ full_name: e.target.value })}
              placeholder="Ej. Juan Pérez"
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto shrink-0">
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Guardar cambios
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Read-only account info ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            Información de Cuenta
            <Badge variant="secondary" className="text-[10px] ml-auto font-normal">Solo lectura</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Row: email + role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoField
              icon={<Mail className="w-3.5 h-3.5" />}
              label="Correo electrónico"
              value={user.email}
            />
            <InfoField
              icon={<Shield className="w-3.5 h-3.5" />}
              label="Rol en el sistema"
              value={
                <Badge
                  className={cn(
                    "text-xs font-semibold border",
                    roleColors[user.role] ?? ""
                  )}
                  variant="outline"
                >
                  {formatRole(user.role)}
                </Badge>
              }
            />
          </div>

          {/* Carreras full-width */}
          <div className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <GraduationCap className="w-3.5 h-3.5" />
              Carrera(s) asignada(s)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {user.careers && user.careers.length > 0 ? (
                user.careers.map((career) => (
                  <Badge key={career.id} variant="outline" className="bg-background text-xs">
                    {career.name}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="text-muted-foreground bg-background italic text-xs">
                  Sin carrera asignada
                </Badge>
              )}
            </div>
          </div>

          {/* Row: phone + telegram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoField
              icon={<Phone className="w-3.5 h-3.5 text-emerald-500" />}
              label="Teléfono / WhatsApp"
              value={
                user.phone_number ? (
                  <span className="font-mono text-sm text-foreground">{user.phone_number}</span>
                ) : null
              }
            />
            <InfoField
              icon={<MessageCircle className="w-3.5 h-3.5 text-sky-500" />}
              label="Telegram Chat ID"
              value={
                user.telegram_chat_id ? (
                  <span className="font-mono text-sm text-foreground">{user.telegram_chat_id}</span>
                ) : null
              }
            />
          </div>

          {/* Footer hint */}
          <p className="text-xs text-muted-foreground text-center pt-1">
            Para actualizar tus datos de contacto, visitá{" "}
            <Link
              href="/configuracion/notificaciones"
              className="text-primary font-medium hover:underline inline-flex items-center gap-0.5"
            >
              Preferencias de Notificación
              <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Helper component ── */
interface InfoFieldProps {
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
}

function InfoField({ icon, label, value }: InfoFieldProps) {
  return (
    <div className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium text-foreground min-h-[1.25rem]">
        {value ?? (
          <span className="text-muted-foreground italic text-xs">No configurado</span>
        )}
      </div>
    </div>
  );
}
