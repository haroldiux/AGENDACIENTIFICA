"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Calendar,
  FlaskConical,
  FileBarChart,
  Upload,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  FileText,
  Clock,
  Activity,
  Printer,
  HelpCircle,
  ShieldCheck,
  Tag,
  Eye,
  UserCheck,
  Building2,
} from "lucide-react";
import { useUser } from "@/context/AuthContext";

interface StepData {
  title: string;
  badge: string;
  icon: React.ReactNode;
  description: string;
  highlights: string[];
  tip?: string;
}

// --- TRACK 1: ADMINS & AUTORIDADES (super_admin, admin, vicerrectorado) ---
const ADMIN_STEPS: StepData[] = [
  {
    title: "¡Bienvenido, Autoridad / Administrador!",
    badge: "Guía Institucional · Admin",
    icon: <ShieldCheck className="w-8 h-8 text-purple-400" />,
    description:
      "Como Administrador o Vicerrectorado, tenés acceso global para supervisar, auditar y controlar toda la planificación científica e investigativa de la UNITEPC.",
    highlights: [
      "🏛️ Visión Global: Monitoreo de actividades de todas las carreras y sedes académicas.",
      "🛡️ Auditoría Integral: Registro histórico con fecha, hora y usuario exacto de cada modificación.",
      "📊 Reportes Ejecutivos: Descarga de agendas institucionalmente formateadas y métricas de cumplimiento.",
    ],
    tip: "Esta guía está personalizada según tu rol de Administrador. Podés volver a abrirla desde el menú lateral 'Guía del Sistema'.",
  },
  {
    title: "Gestión de Categorías y paleta de colores",
    badge: "Paso 1 de 4",
    icon: <Tag className="w-8 h-8 text-primary" />,
    description:
      "Administrá los tipos y categorías de eventos científicos en la sección '/configuracion/categorias'.",
    highlights: [
      "🎨 Teoría del Color: Asignación de colores contrastantes por tipo de evento para evitar confusiones en el calendario.",
      "⚙️ Ámbito Personalizado: Definición de categorías académicas, científicas o mixtas.",
    ],
    tip: "Mantener colores diferenciados ayuda a que los directores identifiquen de un vistazo sus eventos.",
  },
  {
    title: "Auditoría de Cambios y Trazabilidad por Usuario",
    badge: "Paso 2 de 4",
    icon: <Activity className="w-8 h-8 text-emerald-400" />,
    description:
      "Cada acción en el sistema guarda una marca indeleble en el Historial de Auditoría.",
    highlights: [
      "📄 Botón 'Ver Informe': Abre la ficha individual con el historial completo de quién modificó qué campo y cuándo.",
      "👤 Identificación de Actor: Nombre completo, correo y rol del usuario que ejecutó la edición o subida de evidencia.",
      "📝 Diffs Detallados: Registro específico de cambios de fecha, horarios, estado o responsables.",
    ],
    tip: "Haciendo clic en la ficha individual podés verificar la validez de las evidencias cargadas.",
  },
  {
    title: "Reporte de Seguimiento y Cumplimiento %",
    badge: "Paso 3 de 4",
    icon: <FileBarChart className="w-8 h-8 text-blue-400" />,
    description:
      "Evaluá la tasa de cumplimiento efectivo de actividades por carrera en tiempo real.",
    highlights: [
      "📈 Porcentaje de Avance: Cálculo automático de actividades completadas vs canceladas/postpuestas.",
      "📑 Exportación en PDF y Excel: Reportes oficiales para la junta académica o dirección de sede.",
      "👁️ Visor Interactivo: Inspección instantánea de porcentajes antes de generar el documento.",
    ],
    tip: "Al entrar a '/reportes', el sistema selecciona automáticamente la gestión académica activa.",
  },
];

// --- TRACK 2: DIRECTORES DE INVESTIGACIÓN Y CARRERA (director_investigacion, carrera_director, docente) ---
const MANAGER_STEPS: StepData[] = [
  {
    title: "¡Bienvenido, Director de Carrera / Investigación!",
    badge: "Guía de Gestión de Carrera",
    icon: <GraduationCap className="w-8 h-8 text-primary" />,
    description:
      "Tu rol te permite planificar, ejecutar, actualizar estados y adjuntar los respaldos de las actividades investigativas de tu carrera.",
    highlights: [
      "📅 Planificación de Eventos: Asignación de fechas, horas, responsables y tipos de evento.",
      "⚡ Actualización de Estado: Registro de avance (En progreso, Completada, Cancelada) con justificaciones.",
      "📎 Resguardo de Evidencias: Subida de actas, fotos, afiches e informes en PDF, Word o Imagen.",
    ],
    tip: "Esta guía te orientará en el flujo diario para mantener la agenda de tu carrera al día.",
  },
  {
    title: "Calendario Interactivo y Horarios",
    badge: "Paso 1 de 4",
    icon: <Calendar className="w-8 h-8 text-emerald-400" />,
    description:
      "Organizá tu calendario mensual, semanal o diario y navegá con 'Hoy', 'Anterior' y 'Siguiente'.",
    highlights: [
      "🗓️ Vistas Personalizadas: Cambiá entre vista de Mes, Semana y Día segun tu necesidad.",
      "⏱️ Horario Específico: Cada evento cuenta con hora de inicio y fin para evitar cruces en el mismo día.",
      "⚡ Estado Rápido: Hacé clic sobre la tarjeta de un evento en el calendario para cambiar su estado.",
    ],
    tip: "Tus eventos se destacan según el color del tipo de actividad seleccionado.",
  },
  {
    title: "Tabla sin Scroll y Botón 'Cambiar Estado'",
    badge: "Paso 2 de 4",
    icon: <FlaskConical className="w-8 h-8 text-blue-400" />,
    description:
      "En '/actividades' tenés un listado limpio que entra 100% en tu pantalla.",
    highlights: [
      "⚡ Botón 'Cambiar Estado': Cambiá a 'Completada' o 'Cancelada', escribí observaciones y subí respaldos digitales (PDF, Imagen, DOCX hasta 10MB).",
      "📄 Botón 'Ver Informe': Ficha individual con historial de cambios y botón para imprimir en 1 hoja limpia.",
      "✏️ Edición Rápida: Actualizá responsables, fechas o títulos en cualquier momento.",
    ],
    tip: "Los respaldos cargados quedan asociados para siempre a la actividad como evidencia oficial.",
  },
  {
    title: "Carga Masiva mediante Excel y Reportes",
    badge: "Paso 3 de 4",
    icon: <Upload className="w-8 h-8 text-amber-400" />,
    description:
      "Optimizá tu tiempo cargando múltiples actividades mediante la plantilla Excel oficial.",
    highlights: [
      "📥 Plantilla Excel: Descargá el formato oficial desde la sección '/importar'.",
      "📄 Exportación de Agendas: Descargá la agenda de tu carrera en PDF o Excel desde '/reportes'.",
    ],
    tip: "La plantilla valida automáticamente las fechas y gestiones para evitar errores.",
  },
];

// --- TRACK 3: USUARIOS DE SOLO LECTURA (read_only) ---
const READ_ONLY_STEPS: StepData[] = [
  {
    title: "¡Bienvenido a la Consulta de Agenda!",
    badge: "Guía de Consulta · Solo Lectura",
    icon: <Eye className="w-8 h-8 text-blue-400" />,
    description:
      "Tu cuenta te permite consultar, revisar y descargar toda la programación científica e investigativa de la UNITEPC.",
    highlights: [
      "🔍 Visor en Tiempo Real: Consulta de eventos por carrera, gestión y tipo de actividad.",
      "📄 Fichas Informativas: Acceso a los detalles de cada evento y sus archivos adjuntos públicos.",
      "📑 Descarga de Agendas: Exportación de reportes institucionales en PDF y Excel.",
    ],
    tip: "Tenés permisos de consulta. Para modificar eventos contactá a tu Director de Carrera o Administrador.",
  },
  {
    title: "Navegación del Calendario",
    badge: "Paso 1 de 3",
    icon: <Calendar className="w-8 h-8 text-emerald-400" />,
    description:
      "Explorá las actividades planificadas utilizando las vistas de Mes, Semana y Día.",
    highlights: [
      "🗓️ Filtros por Carrera: Seleccioná tu carrera o la opción 'Todas las Carreras' para ver el panorama general.",
      "⏱️ Rangos de Horario: Hacé clic en cualquier evento para ver sus horarios exactos.",
    ],
    tip: "Las actividades globales del Vicerrectorado están disponibles para todas las carreras.",
  },
  {
    title: "Ficha Informativa y Descarga de Reportes",
    badge: "Paso 2 de 3",
    icon: <FileText className="w-8 h-8 text-purple-400" />,
    description:
      "Accedé a los informes individuales y descargá los respaldos disponibles.",
    highlights: [
      "📄 Ficha Individual (Icono Hoja): Ver observaciones, respaldos subidos y descargar la ficha en PDF.",
      "📑 Exportación en Reportes: Descargá agendas institucionales completas en Excel o PDF.",
    ],
    tip: "Podés volver a consultar esta guía en cualquier momento desde el menú lateral 'Guía del Sistema'.",
  },
];

export default function OnboardingTutorialModal() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Dynamically select the tutorial track based on precise user permissions and role
  const getTutorialTrack = (): { trackName: string; steps: StepData[] } => {
    if (!user) {
      return { trackName: "Invitado / General", steps: MANAGER_STEPS };
    }

    const role = (user.role || "").toLowerCase();

    // 1. Global Admin / Vicerrectorado (Supervision, Audits, Color Categories, Executive Reports)
    if (["super_admin", "admin", "vicerrectorado"].includes(role)) {
      return {
        trackName: `Administrador (${role.replace(/_/g, " ").toUpperCase()})`,
        steps: ADMIN_STEPS,
      };
    }

    // 2. Academic / Research Managers (Director de Investigación, Director de Carrera, Docente Coordinador)
    if (["director_investigacion", "carrera_director", "docente", "coordinador"].includes(role)) {
      const careerCount = user.careers?.length || 0;
      const careerLabel = careerCount > 0 ? `${careerCount} carrera(s)` : "Gestión de Carrera";
      return {
        trackName: `Director de Carrera (${careerLabel})`,
        steps: MANAGER_STEPS,
      };
    }

    // 3. Read Only / Consultation Users
    if (role === "read_only") {
      return {
        trackName: "Consulta / Solo Lectura",
        steps: READ_ONLY_STEPS,
      };
    }

    // Fallback: Check if user has assigned careers (Management capabilities)
    if (user.careers && user.careers.length > 0) {
      return {
        trackName: `Gestor de Carrera (${user.careers.length} carreras)`,
        steps: MANAGER_STEPS,
      };
    }

    return {
      trackName: "Consulta Institucional",
      steps: READ_ONLY_STEPS,
    };
  };

  const { trackName, steps } = getTutorialTrack();

  useEffect(() => {
    // Check if user has already completed or dismissed onboarding
    const hasSeen = localStorage.getItem("unitepc_onboarding_seen");
    if (!hasSeen) {
      setIsOpen(true);
    }

    // Listen to custom trigger event from Sidebar
    const handleOpenTrigger = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };
    window.addEventListener("open-unitepc-onboarding", handleOpenTrigger);
    return () => window.removeEventListener("open-unitepc-onboarding", handleOpenTrigger);
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("unitepc_onboarding_seen", "true");
    setIsOpen(false);
  };

  const step = steps[currentStep] || steps[0];

  return (
    <>
      {/* Floating Trigger Button on bottom-right */}
      <button
        type="button"
        onClick={() => {
          setCurrentStep(0);
          setIsOpen(true);
        }}
        title={`Ver Guía y Tutorial del Sistema (${trackName})`}
        className="fixed bottom-5 right-5 z-40 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-xs font-semibold"
      >
        <Sparkles className="w-4 h-4 animate-pulse" />
        <span className="hidden sm:inline">Guía del Sistema</span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-border shadow-2xl">
          {/* Top Banner with Role Track Indicator & Progress Bar */}
          <div className="bg-primary/10 border-b border-border p-5 relative">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-background border border-border rounded-xl shadow-sm">
                  {step.icon}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-[11px]">
                      {step.badge}
                    </Badge>
                    <Badge variant="secondary" className="bg-background/80 text-muted-foreground border-border text-[10px] gap-1">
                      <UserCheck className="w-3 h-3 text-primary" /> Rol: {trackName}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-foreground leading-tight">
                    {step.title}
                  </h3>
                </div>
              </div>
            </div>

            {/* Step Progress Dots */}
            <div className="flex items-center gap-1.5 pt-3">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStep
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  title={`Ir al paso ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Step Body Content */}
          <div className="p-6 space-y-4 text-xs">
            <p className="text-foreground text-sm leading-relaxed font-medium">
              {step.description}
            </p>

            <div className="space-y-2 bg-muted/30 border border-border p-3.5 rounded-xl">
              <span className="font-semibold text-foreground text-xs block mb-1">
                Aspectos Clave para tu Rol ({trackName}):
              </span>
              {step.highlights.map((hl, i) => (
                <div key={i} className="flex items-start gap-2 text-muted-foreground leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{hl}</span>
                </div>
              ))}
            </div>

            {step.tip && (
              <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex items-start gap-2.5 text-blue-400">
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-xs leading-normal">
                  <strong>Tip para tu Rol:</strong> {step.tip}
                </span>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between gap-3 p-4 bg-muted/20 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleComplete}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              Saltar Guía
            </Button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  className="gap-1 text-xs"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </Button>
              )}
              <Button size="sm" onClick={handleNext} className="gap-1 text-xs font-semibold">
                {currentStep === steps.length - 1 ? (
                  <>
                    ¡Entendido, Empezar! <CheckCircle2 className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    Siguiente <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
