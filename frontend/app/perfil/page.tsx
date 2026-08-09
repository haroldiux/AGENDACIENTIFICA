"use client";

import { useEffect, useMemo, useState } from "react";
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
  CheckCircle2,
  Copy,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "@/context/AuthContext";
import { api, type ScientificActivity, type AcademicActivity } from "@/lib/api";
import { Button } from "@/components/ui/button";
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

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

export default function ProfilePage() {
  const { user, login } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    telegram_chat_id: "",
  });

  const [academic, setAcademic] = useState<AcademicActivity[]>([]);
  const [scientific, setScientific] = useState<ScientificActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

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

  useEffect(() => {
    let cancelled = false;
    setActivitiesLoading(true);
    Promise.all([api.academic.list(), api.scientific.list()])
      .then(([academicData, scientificData]) => {
        if (!cancelled) {
          setAcademic(academicData || []);
          setScientific(scientificData || []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("No se pudieron cargar las actividades para el resumen.");
        }
      })
      .finally(() => {
        if (!cancelled) setActivitiesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const weeklyActivities = useMemo(() => {
    if (!user) return { academic: [], scientific: [] };
    const userCareerIds = new Set(user.careers.map((c) => c.id));
    const today = new Date();
    const nextWeek = addDays(today, 7);

    const belongsToUser = (activity: { career_id?: number | null }) => {
      if (activity.career_id == null) return true;
      return userCareerIds.has(activity.career_id);
    };

    const withinRange = (startDate: string) => {
      const start = new Date(`${startDate}T12:00:00`);
      return start >= today && start <= nextWeek;
    };

    const userAcademic = academic
      .filter((a) => belongsToUser(a) && withinRange(a.start_date))
      .sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );

    const userScientific = scientific
      .filter(
        (a) =>
          belongsToUser(a) &&
          withinRange(a.start_date) &&
          a.status !== "cancelled"
      )
      .sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );

    return { academic: userAcademic, scientific: userScientific };
  }, [academic, scientific, user]);

  const buildSummaryMessage = (): string | null => {
    if (!user) return null;
    const { academic: userAcademic, scientific: userScientific } =
      weeklyActivities;

    if (userAcademic.length === 0 && userScientific.length === 0) {
      return null;
    }

    const lines = [
      `Hola ${user.full_name || user.email}, estas son tus actividades de la próxima semana:`,
      "",
    ];

    if (userAcademic.length > 0) {
      lines.push("*Actividades Académicas:*");
      userAcademic.forEach((act) => {
        lines.push(`- ${act.title} (${formatDate(act.start_date)})`);
      });
      lines.push("");
    }

    if (userScientific.length > 0) {
      lines.push("*Actividades Científicas:*");
      userScientific.forEach((act) => {
        lines.push(`- ${act.title} (${formatDate(act.start_date)})`);
      });
    }

    return lines.join("\n");
  };

  const handleSendWhatsApp = () => {
    if (!form.phone_number) {
      toast.error("Agregá tu número de WhatsApp para enviar el resumen.");
      return;
    }

    const message = buildSummaryMessage();
    if (!message) {
      toast("No tenés actividades programadas para la próxima semana.", {
        icon: "ℹ️",
      });
      return;
    }

    setIsSending(true);
    const phone = normalizePhone(form.phone_number);
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${phone}?text=${encoded}`;

    // Pequeña demora para dar feedback visual
    setTimeout(() => {
      window.open(url, "_blank", "noopener,noreferrer");
      toast.success("Se abrió WhatsApp con tu resumen semanal.");
      setIsSending(false);
    }, 400);
  };

  const handleTestTelegram = async () => {
    if (!form.telegram_chat_id) {
      toast.error("Agregá tu Telegram Chat ID y guardá los cambios antes de probar.");
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
      "1) Abrí Telegram y buscá a @userinfobot (https://t.me/userinfobot).\n2) Copiá tu *Chat ID* de Telegram.\n3) Pegalo en tu perfil de la Agenda Científica y guardá los cambios.";
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
        description="Gestioná tus datos de contacto y preferencias de notificación."
      />

      {!isProfileComplete && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3 text-amber-200">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Completá tus datos de contacto</p>
            <p className="text-amber-200/80">
              Agregá tu número de WhatsApp o chat ID de Telegram para recibir
              resúmenes semanales de actividades.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Información de contacto</CardTitle>
            <CardDescription>
              Estos datos se usan para enviarte notificaciones y reportes.
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
              <CardTitle>Resumen semanal</CardTitle>
              <CardDescription>
                Enviá un resumen de tus actividades de la próxima semana.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={cn(
                  "rounded-lg border p-3 text-sm",
                  weeklyActivities.academic.length + weeklyActivities.scientific.length > 0
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                    : "bg-muted/50 border-border text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium">Actividades próximas</span>
                </div>
                <p>
                  {weeklyActivities.academic.length} académicas ·{" "}
                  {weeklyActivities.scientific.length} científicas
                </p>
                {activitiesLoading && (
                  <Loader2 className="w-4 h-4 animate-spin mt-2" />
                )}
              </div>

              <Button
                onClick={handleSendWhatsApp}
                disabled={isSending || !form.phone_number}
                className="w-full"
                variant="outline"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Enviar resumen a mi WhatsApp
              </Button>

              {!form.phone_number && (
                <p className="text-xs text-muted-foreground">
                  Agregá tu número de WhatsApp primero para habilitar el envío.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurar Telegram</CardTitle>
              <CardDescription>
                Las notificaciones automáticas se envían por Telegram si tenés un
                Chat ID configurado.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <ol className="list-decimal list-inside space-y-2 text-foreground/90">
                <li>
                  Abrí Telegram y buscá a{" "}
                  <a
                    href="https://t.me/userinfobot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-semibold hover:underline"
                  >
                    @userinfobot
                  </a>.
                </li>
                <li>
                  Copiá tu <strong>Chat ID</strong> de Telegram (número personal).
                </li>
                <li>
                  Pegalo en el campo <strong>Telegram Chat ID</strong> arriba a la izquierda y guardá los cambios.
                </li>
              </ol>

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

              <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 flex items-start gap-2 text-blue-200">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-xs">
                  El sistema envía los resúmenes automáticamente cada semana si
                  detecta un Chat ID.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
