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
  Send,
  Info,
  Copy,
  Bell,
  ArrowRight,
  ExternalLink,
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PageHeader from "@/components/layout/PageHeader";
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

export default function ProfilePage() {
  const { user, login } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || "",
      });
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
      if (token) {
        login(token, updated);
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        "Ocurrió un error al actualizar el perfil.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyTelegramInstructions = () => {
    const text =
      "Pasos para vincular Telegram:\n1) Abrí Telegram y buscá a @userinfobot (https://t.me/userinfobot).\n2) Obtené tu Chat ID numérico enviando un mensaje.\n3) Ingresá a Administrar canales y notificaciones (/configuracion/notificaciones).\n4) Pegá tu Chat ID en el campo Telegram Chat ID y guardá los cambios.";
    navigator.clipboard.writeText(text).then(
      () => toast.success("Instrucciones copiadas al portapapeles"),
      () => toast.error("No se pudo copiar")
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const formatRole = (role: string) => roleLabels[role] || role;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <PageHeader
        title="Mi Perfil"
        description="Gestioná tus datos personales y visualizá la información de tu cuenta."
      />

      {/* Banner al Centro de Preferencias de Notificaciones */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5 sm:mt-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Centro de Preferencias de Notificación
            </h3>
            <p className="text-sm text-muted-foreground">
              Configurá tus canales de entrega (Email, WhatsApp, Telegram), frecuencias de envío y destinos de contacto.
            </p>
          </div>
        </div>
        <Link
          href="/configuracion/notificaciones"
          className={cn(
            buttonVariants({ variant: "default" }),
            "shrink-0 gap-2 w-full sm:w-auto"
          )}
        >
          Administrar canales y notificaciones
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Información de Perfil</CardTitle>
            <CardDescription>
              Tu nombre es editable. Los datos de cuenta y canales de contacto se gestionan como información de solo lectura.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="flex items-center gap-2 font-medium">
                  <User className="w-4 h-4 text-primary" />
                  Nombre completo
                </Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    id="full_name"
                    value={form.full_name}
                    onChange={(e) => setForm({ full_name: e.target.value })}
                    placeholder="Ej. Juan Pérez"
                    className="max-w-md"
                  />
                  <Button type="submit" disabled={isLoading} className="shrink-0">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Guardar cambios
                  </Button>
                </div>
              </div>
            </form>

            <div className="border-t border-border pt-6 space-y-5">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                Datos de Cuenta y Contacto (Solo Lectura)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="p-3.5 rounded-lg border border-border bg-muted/30 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" />
                    Correo electrónico
                  </div>
                  <p className="text-sm font-medium text-foreground break-all">
                    {user.email || <span className="text-muted-foreground italic">No configurado</span>}
                  </p>
                </div>

                {/* Rol */}
                <div className="p-3.5 rounded-lg border border-border bg-muted/30 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Shield className="w-3.5 h-3.5" />
                    Rol en el sistema
                  </div>
                  <div>
                    <Badge variant="secondary" className="font-semibold">
                      {formatRole(user.role)}
                    </Badge>
                  </div>
                </div>

                {/* Carreras */}
                <div className="p-3.5 rounded-lg border border-border bg-muted/30 space-y-1 md:col-span-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Carrera(s) asignada(s)
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {user.careers && user.careers.length > 0 ? (
                      user.careers.map((career) => (
                        <Badge key={career.id} variant="outline" className="bg-background">
                          {career.name}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground bg-background italic">
                        Sin carrera asignada
                      </Badge>
                    )}
                  </div>
                </div>

                {/* WhatsApp / Teléfono */}
                <div className="p-3.5 rounded-lg border border-border bg-muted/30 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    Teléfono / WhatsApp
                  </div>
                  <div>
                    {user.phone_number ? (
                      <Badge variant="outline" className="font-mono text-xs bg-background">
                        {user.phone_number}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground bg-background italic">
                        No configurado
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Telegram Chat ID */}
                <div className="p-3.5 rounded-lg border border-border bg-muted/30 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <MessageCircle className="w-3.5 h-3.5 text-sky-500" />
                    Telegram Chat ID
                  </div>
                  <div>
                    {user.telegram_chat_id ? (
                      <Badge variant="outline" className="font-mono text-xs bg-background">
                        {user.telegram_chat_id}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground bg-background italic">
                        No configurado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground">
                  ¿Querés actualizar tus destinos de contacto para notificaciones?
                </span>
                <Link
                  href="/configuracion/notificaciones"
                  className={cn(
                    buttonVariants({ variant: "link", size: "sm" }),
                    "text-primary font-semibold p-0 h-auto flex items-center gap-1 shrink-0"
                  )}
                >
                  Administrar canales y notificaciones
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Send className="w-4 h-4 text-sky-500" />
                Guía de Vinculación de Telegram
              </CardTitle>
              <CardDescription>
                Paso a paso para vincular tu cuenta de Telegram en el Centro de Notificaciones.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 text-sm">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    1
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-medium text-foreground">
                      Abrí Telegram y buscá a{" "}
                      <a
                        href="https://t.me/userinfobot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
                      >
                        @userinfobot
                        <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Un bot oficial que te devolverá tu ID numérico de Telegram.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    2
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-medium text-foreground">Obtené tu Chat ID</p>
                    <p className="text-xs text-muted-foreground">
                      Enviá cualquier mensaje al bot y copiá el número indicado en <strong>Id</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    3
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-medium text-foreground">Configurá tu ID en Notificaciones</p>
                    <p className="text-xs text-muted-foreground">
                      Ingresá a Preferencias de Notificación y pegá el ID en el campo de Telegram.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyTelegramInstructions}
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar instrucciones
                </Button>

                <Link
                  href="/configuracion/notificaciones"
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "w-full flex items-center justify-center gap-2"
                  )}
                >
                  <Bell className="w-4 h-4" />
                  Administrar canales y notificaciones
                </Link>
              </div>

              <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-3 flex items-start gap-2 text-sky-200">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-xs">
                  Las notificaciones y mensajes de prueba se gestionan centralizadamente desde la página de Notificaciones.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

