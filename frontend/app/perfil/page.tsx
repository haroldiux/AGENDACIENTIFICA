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
  AlertTriangle,
  Copy,
  Bell,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PageHeader from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, login } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    telegram_chat_id: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        telegram_chat_id: user.telegram_chat_id || "",
      });
    }
  }, [user]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const updated = await api.users.updateMe({
        full_name: form.full_name || null,
        email: form.email || null,
        phone_number: form.phone_number || null,
        telegram_chat_id: form.telegram_chat_id || null,
      });
      toast.success("Perfil actualizado correctamente");
      // Refrescar usuario en contexto sin perder token
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

  const handleTestTelegram = async () => {
    if (!form.telegram_chat_id) {
      toast.error(
        "Agregá tu Telegram Chat ID y guardá los cambios antes de probar."
      );
      return;
    }
    setIsTestingTelegram(true);
    try {
      await api.users.testTelegram();
      toast.success("Mensaje de prueba enviado por Telegram. Revisá tu chat.");
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        "No se pudo enviar el mensaje de prueba por Telegram.";
      toast.error(message);
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const copyTelegramInstructions = () => {
    const text =
      "Pasos para vincular Telegram:\n1) Abrí Telegram y buscá a @userinfobot (https://t.me/userinfobot).\n2) Obtené tu Chat ID numérico enviando un mensaje.\n3) Pegá tu Chat ID en el campo Telegram Chat ID de tu perfil y guardá los cambios.\n4) Hacé clic en 'Probar bot de Telegram' para verificar.";
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

  const isProfileComplete =
    !!form.phone_number || !!form.telegram_chat_id || !!form.email;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <PageHeader
        title="Mi Perfil"
        description="Gestioná tus datos de contacto y canales de integración."
      />

      {!isProfileComplete && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3 text-amber-200">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Completá tus datos de contacto</p>
            <p className="text-amber-200/80">
              Agregá tu número de WhatsApp o Chat ID de Telegram para habilitar
              las notificaciones de tus actividades.
            </p>
          </div>
        </div>
      )}

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
              Configurá la frecuencia, canales de entrega y tipos de alertas para tus actividades académicas y científicas.
            </p>
          </div>
        </div>
        <Link
          href="/configuracion/notificaciones"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "shrink-0 gap-2 w-full sm:w-auto"
          )}
        >
          Ir a Preferencias
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Información de contacto</CardTitle>
            <CardDescription>
              Estos datos se usan para enviar notificaciones y alertas según tus preferencias.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Nombre completo
                  </Label>
                  <Input
                    id="full_name"
                    value={form.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    placeholder="Juan Pérez"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Correo electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="usuario@unitepc.edu.bo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    WhatsApp
                  </Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    value={form.phone_number}
                    onChange={(e) => handleChange("phone_number", e.target.value)}
                    placeholder="+591 78311416"
                  />
                  <p className="text-xs text-muted-foreground">
                    Incluí el código de país (ej. +591).
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telegram_chat_id" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                    Telegram Chat ID
                  </Label>
                  <Input
                    id="telegram_chat_id"
                    value={form.telegram_chat_id}
                    onChange={(e) =>
                      handleChange("telegram_chat_id", e.target.value)
                    }
                    placeholder="123456789"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Guardar cambios
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurar Telegram</CardTitle>
              <CardDescription>
                Vinculá tu cuenta de Telegram para recibir alertas y notificaciones personalizadas.
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
                      Un bot oficial que te devolverá tu ID de usuario de Telegram.
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
                    <p className="font-medium text-foreground">Guardá tu ID en la plataforma</p>
                    <p className="text-xs text-muted-foreground">
                      Pegalo en el campo <strong>Telegram Chat ID</strong> y hacé clic en <strong>Guardar cambios</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    4
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-medium text-foreground">Verificá la conexión</p>
                    <p className="text-xs text-muted-foreground">
                      Usá el botón de abajo para enviar un mensaje de prueba a tu Telegram.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={copyTelegramInstructions}
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar instrucciones
                </Button>

                <Button
                  size="sm"
                  onClick={handleTestTelegram}
                  disabled={isTestingTelegram || !form.telegram_chat_id}
                  className="w-full"
                >
                  {isTestingTelegram ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Probar bot de Telegram
                </Button>
              </div>

              <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 flex items-start gap-2 text-blue-200">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-xs">
                  Las notificaciones automáticas respetarán la frecuencia y reglas configuradas en tu Centro de Notificaciones.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

