"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  X,
  BookOpen,
} from "lucide-react";

interface StepData {
  title: string;
  badge: string;
  icon: React.ReactNode;
  description: string;
  highlights: string[];
  tip?: string;
}

const TUTORIAL_STEPS: StepData[] = [
  {
    title: "¡Bienvenido a la Agenda Científica UNITEPC!",
    badge: "Introducción y Objetivo",
    icon: <GraduationCap className="w-8 h-8 text-primary" />,
    description:
      "Este sistema está diseñado para organizar, planificar y dar seguimiento a las actividades de investigación e interacción social de todas las carreras de la Universidad Técnica Privada Cosmopolita.",
    highlights: [
      "📌 Gestión unificada de actividades académicas y científicas por gestión académica.",
      "🎯 Control de cumplimiento e hitos institucionales por carrera y ámbito global.",
      "📁 Resguardo digital de respaldos y evidencias de cada evento ejecutado.",
    ],
    tip: "Podés volver a abrir esta guía interactiva en cualquier momento desde el menú lateral haciendo clic en 'Guía del Sistema'.",
  },
  {
    title: "Módulo Calendario: Vistas y Navegación",
    badge: "Paso 1 de 4",
    icon: <Calendar className="w-8 h-8 text-emerald-400" />,
    description:
      "Visualizá la planificación completa por Mes, Semana o Día con códigos de colores diferenciados para evitar confusiones entre tipos de actividades.",
    highlights: [
      "🗓️ Botones de Navegación: 'Hoy', 'Anterior' y 'Siguiente' para desplazarte fluidamente.",
      "⏱️ Horarios Precisos: Las actividades cuentan con fecha y rango de horas de ejecución.",
      "⚡ Estado en Vivo: Hacé clic sobre cualquier actividad en el calendario para cambiar de estado o ver sus detalles.",
    ],
    tip: "Las actividades globales de Vicerrectorado se destacan con un distintivo morado.",
  },
  {
    title: "Módulo Actividades: Tabla y Control de Avance",
    badge: "Paso 2 de 4",
    icon: <FlaskConical className="w-8 h-8 text-blue-400" />,
    description:
      "Un listado adaptativo que entra 100% en tu pantalla sin necesidad de hacer scroll horizontal.",
    highlights: [
      "⚡ Cambiar Estado: Botón verde para actualizar el estado (Programada, En progreso, Completada, Cancelada), agregar observaciones y subir archivos de evidencia (PDF, Imagen, Word).",
      "📄 Ver Informe / Ficha Individual: Botón azul para ver la ficha completa de la actividad con trazabilidad histórica de cambios, responsable y usuario que editó.",
      "🖨️ Exportación PDF Limpia: Generación de ficha impresas en 1 sola hoja sin elementos innecesarios.",
    ],
    tip: "Hacé clic en el encabezado de cualquier columna (Nombre, Fecha, Tipo) para ordenar la lista.",
  },
  {
    title: "Importación Masiva y Carga Excel",
    badge: "Paso 3 de 4",
    icon: <Upload className="w-8 h-8 text-amber-400" />,
    description:
      "Cargá múltiples actividades en segundos subiendo un archivo Excel estandarizado.",
    highlights: [
      "📥 Plantilla Oficial: Descargá la plantilla Excel pre-formateada desde el módulo 'Importar'.",
      "✅ Validación Automática: El sistema verifica carreras, gestiones y fechas antes de guardar.",
    ],
    tip: "Si tu carrera es 'Global / Vicerrectorado', dejá el campo de carrera en blanco en la plantilla.",
  },
  {
    title: "Reportes Institucionales y Seguimiento",
    badge: "Paso 4 de 4",
    icon: <FileBarChart className="w-8 h-8 text-purple-400" />,
    description:
      "Generá agendas en PDF y Excel para presentación a autoridades y realizá el seguimiento de cumplimiento porcentual por carrera.",
    highlights: [
      "📊 Reportes Filtrados: Exportá agendas completas o filtradas por estado (Completadas, Canceladas, En progreso).",
      "📈 Reporte de Seguimiento: Medí el porcentaje de cumplimiento de actividades de cada carrera.",
      "👁️ Visor Interactivo: Inspeccioná métricas en tiempo real antes de exportar.",
    ],
    tip: "Al entrar a Reportes, la gestión activa y tu carrera se seleccionan automáticamente.",
  },
];

export default function OnboardingTutorialModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

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
    if (currentStep < TUTORIAL_STEPS.length - 1) {
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

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <>
      {/* Floating Trigger Button on bottom-right */}
      <button
        type="button"
        onClick={() => {
          setCurrentStep(0);
          setIsOpen(true);
        }}
        title="Ver Guía y Tutorial del Sistema"
        className="fixed bottom-5 right-5 z-40 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-xs font-semibold"
      >
        <Sparkles className="w-4 h-4 animate-pulse" />
        <span className="hidden sm:inline">Guía del Sistema</span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-border shadow-2xl">
          {/* Top Banner with Progress Bar */}
          <div className="bg-primary/10 border-b border-border p-5 relative">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-background border border-border rounded-xl shadow-sm">
                  {step.icon}
                </div>
                <div>
                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-[11px] mb-1">
                    {step.badge}
                  </Badge>
                  <h3 className="text-base font-bold text-foreground leading-tight">
                    {step.title}
                  </h3>
                </div>
              </div>
            </div>

            {/* Step Progress Dots */}
            <div className="flex items-center gap-1.5 pt-2">
              {TUTORIAL_STEPS.map((_, idx) => (
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
                Puntos Clave del Módulo:
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
                  <strong>Tip Recomendado:</strong> {step.tip}
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
                {currentStep === TUTORIAL_STEPS.length - 1 ? (
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
