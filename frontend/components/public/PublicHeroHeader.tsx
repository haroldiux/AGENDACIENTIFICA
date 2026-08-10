"use client";

import React from "react";
import Link from "next/link";
import { Search, GraduationCap, Calendar, LogIn, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PublicHeroHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function PublicHeroHeader({
  searchTerm,
  onSearchChange,
}: PublicHeroHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Top Navbar Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-indigo-800/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-indigo-300 font-semibold">
                UNIVERSIDAD UNITEPC
              </span>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Portal Público Institucional
              </h1>
            </div>
          </div>

          <Link href="/login">
            <Button
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-all"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Acceso Institucional
            </Button>
          </Link>
        </div>

        {/* Hero Content Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-medium backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Agenda Científica & Académica Abierta</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Explora las Actividades Académicas e Investigativas
            </h2>
            <p className="text-indigo-200 text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
              Consulta en tiempo real la programación de eventos, exámenes, ferias, defensas y congresos científicos de la Universidad UNITEPC.
            </p>
          </div>

          {/* Search Box Widget */}
          <div className="lg:col-span-4 bg-white/10 backdrop-blur-md border border-white/15 p-4 sm:p-6 rounded-2xl shadow-2xl">
            <label htmlFor="public-search-input" className="block text-sm font-medium text-indigo-100 mb-2">
              Buscar Actividad o Evento
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300" />
              <Input
                id="public-search-input"
                type="text"
                placeholder="Palabra clave, título, ponente..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-11 pr-4 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border-none rounded-xl shadow-inner focus-visible:ring-2 focus-visible:ring-indigo-400 text-sm"
              />
            </div>
            <p className="mt-2 text-xs text-indigo-300">
              Filtra por nombre de actividad, responsable o categoría.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
