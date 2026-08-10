"use client";

import React, { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Bell,
  Mail,
  MessageSquare,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Save,
  Sparkles,
  ExternalLink,
  Copy,
  HelpCircle,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  api,
  type UserNotificationPreference,
  type UserNotificationPreferenceUpdate,
} from "@/lib/api";
import { useUser } from "@/context/AuthContext";

export default function NotificationPreferencesPage() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testingChannel, setTestingChannel] = useState<string | null>(null);

  // Form State
  const [prefs, setPrefs] = useState<UserNotificationPreferenceUpdate>({
    email_enabled: true,
    whatsapp_enabled: false,
    telegram_enabled: false,
    custom_email: "",
    custom_whatsapp: "",
    custom_telegram_chat_id: "",
    notify_academic: true,
    notify_scientific: true,
    digest_frequency: "weekly",
    lookahead_days: 7,
  });

  const loadPreferences = useCallback(async () => {
    setIsLoading(true);
    try {
      const data: UserNotificationPreference = await api.userPreferences.get();
      setPrefs({
        email_enabled: data.email_enabled,
        whatsapp_enabled: data.whatsapp_enabled,
        telegram_enabled: data.telegram_enabled,
        custom_email: data.custom_email || "",
        custom_whatsapp: data.custom_whatsapp || "",
        custom_telegram_chat_id: data.custom_telegram_chat_id || "",
        notify_academic: data.notify_academic,
        notify_scientific: data.notify_scientific,
        digest_frequency: data.digest_frequency,
        lookahead_days: data.lookahead_days,
      });
    } catch {
      toast.error("No se pudieron cargar las preferencias de notificación.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: UserNotificationPreferenceUpdate = {
        email_enabled: prefs.email_enabled,
        whatsapp_enabled: prefs.whatsapp_enabled,
        telegram_enabled: prefs.telegram_enabled,
        custom_email: prefs.custom_email?.trim() || null,
        custom_whatsapp: prefs.custom_whatsapp?.trim() || null,
        custom_telegram_chat_id: prefs.custom_telegram_chat_id?.trim() || null,
        notify_academic: prefs.notify_academic,
        notify_scientific: prefs.notify_scientific,
        digest_frequency: prefs.digest_frequency,
        lookahead_days: Number(prefs.lookahead_days),
      };

      await api.userPreferences.update(payload);
      toast.success("Preferencias de notificación guardadas con éxito.");
    } catch {
      toast.error("Error al guardar las preferencias de notificación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestChannel = async (channel: "email" | "whatsapp" | "telegram") => {
    setTestingChannel(channel);
    try {
      let target_destination: string | undefined = undefined;
      if (channel === "email" && prefs.custom_email?.trim()) {
        target_destination = prefs.custom_email.trim();
      } else if (channel === "whatsapp" && prefs.custom_whatsapp?.trim()) {
        target_destination = prefs.custom_whatsapp.trim();
      } else if (channel === "telegram" && prefs.custom_telegram_chat_id?.trim()) {
        target_destination = prefs.custom_telegram_chat_id.trim();
      }

      const res = await api.notifications.testChannel({
        channel,
        target_destination,
      });

      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error(`Error al enviar la prueba para el canal ${channel}.`);
    } finally {
      setTestingChannel(null);
    }
  };

  const copyTelegramInstructions = () => {
    const text =
      "Pasos para obtener tu Telegram Chat ID:\n1) Abrí Telegram y buscá a @userinfobot (https://t.me/userinfobot).\n2) Obtené tu Chat ID numérico enviando un mensaje al bot.\n3) Pegá tu Chat ID en el campo Chat ID de Telegram y guardá tus preferencias.";
    navigator.clipboard.writeText(text).then(
      () => toast.success("Instrucciones copiadas al portapapeles"),
      () => toast.error("No se pudo copiar")
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <Toaster position="top-right" />

      <PageHeader
        title="Centro de Preferencias de Notificaciones"
        description="Gestiona tus canales de comunicación (Email, WhatsApp, Telegram), frecuencias de envío y destinos de contacto."
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Canales de Notificación */}
        <Card className="p-6 border-border shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Canales de Notificación</h2>
              <p className="text-xs text-muted-foreground">
                Selecciona por cuáles medios deseas recibir resúmenes periódicos y avisos de eventos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Email Channel */}
            <div className={`p-5 rounded-xl border transition-all space-y-4 ${prefs.email_enabled ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-sm text-foreground">Correo Electrónico</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.email_enabled}
                    onChange={(e) => setPrefs((prev) => ({ ...prev, email_enabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Email personalizado (opcional)
                </label>
                <input
                  type="email"
                  value={prefs.custom_email || ""}
                  onChange={(e) => setPrefs((prev) => ({ ...prev, custom_email: e.target.value }))}
                  placeholder={user?.email ? `Default: ${user.email}` : "correo@ejemplo.com"}
                  className="w-full p-2 bg-background border border-input rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleTestChannel("email")}
                disabled={testingChannel === "email"}
                className="w-full flex items-center justify-center gap-2 text-xs"
              >
                {testingChannel === "email" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Probar Email
              </Button>
            </div>

            {/* WhatsApp Channel */}
            <div className={`p-5 rounded-xl border transition-all space-y-4 ${prefs.whatsapp_enabled ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border bg-card'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-500" />
                  <span className="font-semibold text-sm text-foreground">WhatsApp</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.whatsapp_enabled}
                    onChange={(e) => setPrefs((prev) => ({ ...prev, whatsapp_enabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Teléfono / Móvil (+591...)
                </label>
                <input
                  type="text"
                  value={prefs.custom_whatsapp || ""}
                  onChange={(e) => setPrefs((prev) => ({ ...prev, custom_whatsapp: e.target.value }))}
                  placeholder={user?.phone_number ? `Default: ${user.phone_number}` : "+591 70000000"}
                  className="w-full p-2 bg-background border border-input rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleTestChannel("whatsapp")}
                disabled={testingChannel === "whatsapp"}
                className="w-full flex items-center justify-center gap-2 text-xs"
              >
                {testingChannel === "whatsapp" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Probar WhatsApp
              </Button>
            </div>

            {/* Telegram Channel */}
            <div className={`p-5 rounded-xl border transition-all space-y-4 ${prefs.telegram_enabled ? 'border-sky-500/40 bg-sky-500/5' : 'border-border bg-card'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-sky-500" />
                  <span className="font-semibold text-sm text-foreground">Telegram</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.telegram_enabled}
                    onChange={(e) => setPrefs((prev) => ({ ...prev, telegram_enabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Chat ID de Telegram
                </label>
                <input
                  type="text"
                  value={prefs.custom_telegram_chat_id || ""}
                  onChange={(e) => setPrefs((prev) => ({ ...prev, custom_telegram_chat_id: e.target.value }))}
                  placeholder={user?.telegram_chat_id ? `Default: ${user.telegram_chat_id}` : "Ej: 123456789"}
                  className="w-full p-2 bg-background border border-input rounded-lg text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Guía para obtener Telegram Chat ID */}
              <div className="p-3.5 rounded-lg border border-sky-500/30 bg-sky-500/10 space-y-3 text-xs">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <HelpCircle className="w-4 h-4 shrink-0 text-sky-500" />
                  <span>¿Cómo obtener tu Telegram Chat ID?</span>
                </div>

                <ol className="space-y-1.5 text-muted-foreground text-[11px] list-decimal list-inside pl-0.5">
                  <li>
                    Abrí Telegram y buscá a{" "}
                    <a
                      href="https://t.me/userinfobot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-sky-500 font-semibold hover:underline"
                    >
                      @userinfobot
                      <ExternalLink className="w-2.5 h-2.5 inline" />
                    </a>.
                  </li>
                  <li>Obtené tu Chat ID numérico enviando un mensaje al bot.</li>
                  <li>Pegá tu Chat ID en el campo de arriba y guardá tus preferencias.</li>
                </ol>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={copyTelegramInstructions}
                  className="w-full text-xs h-7 gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copiar instrucciones
                </Button>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleTestChannel("telegram")}
                disabled={testingChannel === "telegram"}
                className="w-full flex items-center justify-center gap-2 text-xs"
              >
                {testingChannel === "telegram" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Probar Telegram
              </Button>
            </div>
          </div>
        </Card>

        {/* Categorías de Eventos & Frecuencia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categorías de Eventos */}
          <Card className="p-6 border-border shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-500">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Categorías de Eventos</h3>
                <p className="text-xs text-muted-foreground">Filtra los tipos de eventos en tus alertas.</p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                <div>
                  <p className="text-xs font-semibold text-foreground">Actividades Académicas</p>
                  <p className="text-[11px] text-muted-foreground">Exámenes, feriados, fechas del calendario institucional.</p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.notify_academic}
                  onChange={(e) => setPrefs((prev) => ({ ...prev, notify_academic: e.target.checked }))}
                  className="w-4 h-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                <div>
                  <p className="text-xs font-semibold text-foreground">Actividades Científicas</p>
                  <p className="text-[11px] text-muted-foreground">Congresos, webinars, ferias, defensas de grado.</p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.notify_scientific}
                  onChange={(e) => setPrefs((prev) => ({ ...prev, notify_scientific: e.target.checked }))}
                  className="w-4 h-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                />
              </div>
            </div>
          </Card>

          {/* Frecuencia y Anticipación */}
          <Card className="p-6 border-border shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Frecuencia y Anticipación</h3>
                <p className="text-xs text-muted-foreground">Personaliza el ritmo de envío y alcance temporal.</p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Frecuencia de Resumen
                </label>
                <select
                  value={prefs.digest_frequency}
                  onChange={(e) =>
                    setPrefs((prev) => ({
                      ...prev,
                      digest_frequency: e.target.value as "daily" | "weekly" | "biweekly",
                    }))
                  }
                  className="w-full p-2.5 bg-background border border-input rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="daily">Diario (Resumen cada mañana)</option>
                  <option value="weekly">Semanal (Cada lunes por la mañana)</option>
                  <option value="biweekly">Quincenal (Cada 15 días)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Ventana de Anticipación (Días a futuro)
                </label>
                <select
                  value={prefs.lookahead_days}
                  onChange={(e) =>
                    setPrefs((prev) => ({
                      ...prev,
                      lookahead_days: Number(e.target.value),
                    }))
                  }
                  className="w-full p-2.5 bg-background border border-input rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value={3}>3 días</option>
                  <option value={7}>7 días (1 semana)</option>
                  <option value={14}>14 días (2 semanas)</option>
                  <option value={30}>30 días (1 mes)</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" size="lg" disabled={isSubmitting} className="flex items-center gap-2">
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Guardar Preferencias
          </Button>
        </div>
      </form>
    </div>
  );
}
