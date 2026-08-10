"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  api,
  PublicCalendarItem,
  PublicEventDetail,
  PublicMetadata,
  PublicCalendarFilters,
} from "@/lib/api";
import PublicHeroHeader from "@/components/public/PublicHeroHeader";
import PublicCalendarExplorer from "@/components/public/PublicCalendarExplorer";
import PublicEventDetailModal from "@/components/public/PublicEventDetailModal";

export default function PublicPortalPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [metadata, setMetadata] = useState<PublicMetadata | null>(null);
  const [events, setEvents] = useState<PublicCalendarItem[]>([]);
  const [filters, setFilters] = useState<PublicCalendarFilters>({});
  const [selectedEvent, setSelectedEvent] = useState<PublicEventDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Load Metadata
  useEffect(() => {
    api.publicPortal
      .getMetadata()
      .then((data) => setMetadata(data))
      .catch((err) => console.error("Failed to load public portal metadata:", err));
  }, []);

  // Fetch Calendar Events
  const fetchCalendar = useCallback((currentFilters: PublicCalendarFilters, search: string) => {
    setIsLoadingEvents(true);
    const queryParams: PublicCalendarFilters = {
      ...currentFilters,
      search: search.trim() ? search.trim() : null,
    };

    api.publicPortal
      .getCalendar(queryParams)
      .then((res) => {
        setEvents(res.items || []);
      })
      .catch((err) => {
        console.error("Failed to load public calendar events:", err);
        setEvents([]);
      })
      .finally(() => {
        setIsLoadingEvents(false);
      });
  }, []);

  // Debounced/Effect trigger for search and filters
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCalendar(filters, searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, searchTerm, fetchCalendar]);

  // Handle Event Click
  const handleSelectEvent = (eventItem: PublicCalendarItem) => {
    setIsModalOpen(true);
    setIsLoadingDetail(true);
    setSelectedEvent(null);

    api.publicPortal
      .getEventDetail(eventItem.id, eventItem.source_type)
      .then((data) => {
        setSelectedEvent(data);
      })
      .catch((err) => {
        console.error("Failed to fetch public event detail:", err);
      })
      .finally(() => {
        setIsLoadingDetail(false);
      });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({});
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <div>
        {/* Institutional Hero Header */}
        <PublicHeroHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Interactive Calendar Explorer */}
        <PublicCalendarExplorer
          events={events}
          metadata={metadata}
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={handleClearFilters}
          onSelectEvent={handleSelectEvent}
          isLoading={isLoadingEvents}
        />
      </div>

      {/* Event Detail Modal */}
      <PublicEventDetailModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isLoading={isLoadingDetail}
      />

      {/* Institutional Footer */}
      <footer className="mt-12 py-8 bg-slate-900 text-slate-400 text-center text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© {new Date().getFullYear()} Universidad UNITEPC - Agenda Académica y Científica Institucional.</p>
          <p className="text-slate-500">Todos los derechos reservados. Información pública para estudiantes, docentes e investigadores.</p>
        </div>
      </footer>
    </div>
  );
}
