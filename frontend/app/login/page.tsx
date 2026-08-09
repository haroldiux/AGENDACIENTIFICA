"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { GraduationCap, Loader2, AlertCircle, Lock, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { login } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor, ingrese correo y contraseña.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await api.auth.login(email, password);
      if (res && res.access_token) {
        login(res.access_token);
        router.push("/");
      } else {
        setError("Respuesta de autenticación inválida.");
      }
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        "Credenciales incorrectas. Por favor, intente nuevamente.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-background">
      {/* Left Brand & Wave Panel */}
      <div className="lg:col-span-5 relative flex flex-col justify-between p-8 lg:p-12 overflow-hidden bg-gradient-to-br from-[#6B3392] via-[#4A1D6D] to-[#009E96] text-white min-h-[260px] lg:min-h-screen">
        {/* Ambient background glow & SVG Waves */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Top light accent circle */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#009E96]/30 rounded-full blur-2xl" />

          {/* SVG Wave Graphic 1 */}
          <svg
            className="absolute bottom-0 left-0 w-full opacity-20 text-white fill-current"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path d="M0,192L48,202.7C96,213,192,235,288,229.3C384,224,480,192,576,181.3C672,171,768,181,864,202.7C960,224,1056,256,1152,245.3C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>

          {/* SVG Wave Graphic 2 */}
          <svg
            className="absolute bottom-0 left-0 w-full opacity-15 text-[#009E96] fill-current"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path d="M0,96L48,128C96,160,192,224,288,240C384,256,480,224,576,192C672,160,768,128,864,138.7C960,149,1056,203,1152,218.7C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>

        {/* Brand Header / Logo */}
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-wider">UNITEPC</span>
          </div>

          <div className="hidden lg:block pt-8 space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
              UNITEPC
            </h1>
            <p className="text-lg text-white/80 font-medium max-w-sm">
              Sistema de Gestión de Agenda Científica
            </p>
          </div>
        </div>

        {/* Mobile branding label */}
        <div className="lg:hidden relative z-10 my-4 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            UNITEPC
          </h1>
          <p className="text-xs text-white/80 font-medium">
            Sistema de Gestión de Agenda Científica
          </p>
        </div>

        {/* Footer quote/badge for desktop */}
        <div className="relative z-10 hidden lg:block space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/70 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-[#009E96]" />
            Plataforma Institucional de Investigación
          </div>
          <p className="text-xs text-white/60">
            &copy; {new Date().getFullYear()} Universidad Técnica Privada Cosmos. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-16 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Iniciar Sesión
            </h2>
            <p className="text-sm text-muted-foreground">
              Ingresá tus credenciales para continuar
            </p>
          </div>

          {/* Inline Error Alert */}
          {error && (
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-start gap-3 text-destructive text-sm animate-in fade-in-50 duration-200">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground uppercase tracking-wider pl-1">
                Correo Electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@unitepc.edu.bo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="rounded-full h-12 py-5 pl-12 pr-6 bg-muted/40 border-border/60 focus-visible:ring-2 focus-visible:ring-[#009E96] transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground uppercase tracking-wider pl-1">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="rounded-full h-12 py-5 pl-12 pr-6 bg-muted/40 border-border/60 focus-visible:ring-2 focus-visible:ring-[#009E96] transition-all text-sm"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-full py-5 font-semibold text-base bg-gradient-to-r from-[#6B3392] to-[#009E96] hover:brightness-110 shadow-lg shadow-[#6B3392]/30 text-white transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          {/* Footer note */}
          <div className="pt-4 text-center lg:text-left">
            <p className="text-xs text-muted-foreground">
              Departamento de Investigación Científica &copy; {new Date().getFullYear()} UNITEPC
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

