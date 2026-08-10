"use client";

import React, { useState } from "react";
import {
  PublicCalendarItem,
  PublicMetadata,
  PublicCalendarFilters,
} from "@/lib/api";
import {
  Calendar as CalendarIcon,
  Filter,
  Grid,
  List,
  RotateCcw,
  BookOpen,
  FlaskConical,
  Clock,
  MapPin,
  Building2,
  Tag,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface PublicCalendarExplorerProps {
  events: PublicCalendarItem[];
  metadata: PublicMetadata | null;
  filters: PublicCalendarFilters;
  onFilterChange: (newFilters: PublicCalendarFilters) => void;
  onClearFilters: () => void;
  onSelectEvent: (event: PublicCalendarItem) => void;
  isLoading: boolean;
}

export default function PublicCalendarExplorer({
  events,
  metadata,
  filters,
  onFilterChange,
  onClearFilters,
  onSelectEvent,
  isLoading,
}: PublicCalendarExplorerProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const handleSelectChange = (
    key: keyof PublicCalendarFilters,
    value: string
  ) => {
    const parsed = value ? Number(value) : null;
    onFilterChange({
      ...filters,
      [key]: parsed,
    });
  };

  const handleDateChange = (
    key: "start_date" | "end_date",
    value: string
  ) => {
    onFilterChange({
      ...filters,
      [key]: value || null,
    });
  };

  const hasActiveFilters =
    filters.gestion_id ||
    filters.sede_id ||
    filters.career_id ||
    filters.category_id ||
    filters.start_date ||
    filters.end_date ||
    filters.search;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Controls & Toolbar Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-lg">
            <Filter className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Filtros de Exploración</span>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Limpiar Filtros
              </Button>
            )}

            {/* Grid / List View Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                }`}
              >
                <Grid className="w-4 h-4" />
                <span className="hidden sm:inline">Tarjetas</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                  viewMode === "list"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Lista</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters Dropdown Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Gestión Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Gestión
            </label>
            <select
              value={filters.gestion_id || ""}
              onChange={(e) => handleSelectChange("gestion_id", e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Todas las Gestiones</option>
              {metadata?.gestiones.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sede Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Sede
            </label>
            <select
              value={filters.sede_id || ""}
              onChange={(e) => handleSelectChange("sede_id", e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Todas las Sedes</option>
              {metadata?.sedes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Carrera Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Carrera
            </label>
            <select
              value={filters.career_id || ""}
              onChange={(e) => handleSelectChange("career_id", e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Todas las Carreras</option>
              {metadata?.careers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Categoría
            </label>
            <select
              value={filters.category_id || ""}
              onChange={(e) => handleSelectChange("category_id", e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Todas las Categorías</option>
              {metadata?.categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Desde
            </label>
            <Input
              type="date"
              value={filters.start_date || ""}
              onChange={(e) => handleDateChange("start_date", e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs py-1.5"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Hasta
            </label>
            <Input
              type="date"
              value={filters.end_date || ""}
              onChange={(e) => handleDateChange("end_date", e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs py-1.5"
            />
          </div>
        </div>
      </div>

      {/* Main Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {events.length} {events.length === 1 ? "actividad encontrada" : "actividades encontradas"}
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500">Cargando eventos de la agenda...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
            <CalendarIcon className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              No se encontraron actividades
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Intenta cambiar los filtros seleccionados o buscar con otra palabra clave.
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={onClearFilters} className="mt-2">
                Restablecer Filtros
              </Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => {
              const isAcademic = event.source_type === "academic";
              return (
                <Card
                  key={`${event.source_type}-${event.id}`}
                  onClick={() => onSelectEvent(event)}
                  className="group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between"
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        className={
                          isAcademic
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100 border-blue-200"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 border-emerald-200"
                        }
                      >
                        {isAcademic ? (
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            Académico
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <FlaskConical className="w-3 h-3" />
                            Científico
                          </span>
                        )}
                      </Badge>

                      {event.category && (
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                          {event.category}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {event.title}
                    </h3>

                    {/* Details Info */}
                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>
                          {event.start_date}
                          {event.end_date !== event.start_date && ` al ${event.end_date}`}
                        </span>
                      </div>

                      {event.start_time && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>
                            {event.start_time}
                            {event.end_time && ` - ${event.end_time}`}
                          </span>
                        </div>
                      )}

                      {event.career_name && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span className="truncate">{event.career_name}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {/* Card Footer */}
                  <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    <span>Ver detalles</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-sm">
            {events.map((event) => {
              const isAcademic = event.source_type === "academic";
              return (
                <div
                  key={`${event.source_type}-${event.id}`}
                  onClick={() => onSelectEvent(event)}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        className={
                          isAcademic
                            ? "bg-blue-100 text-blue-800 text-[10px]"
                            : "bg-emerald-100 text-emerald-800 text-[10px]"
                        }
                      >
                        {isAcademic ? "Académico" : "Científico"}
                      </Badge>
                      {event.career_name && (
                        <span className="text-xs text-slate-500 font-medium">
                          {event.career_name}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {event.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{event.start_date}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
