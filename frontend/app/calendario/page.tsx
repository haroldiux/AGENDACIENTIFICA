"use client";
import { useState, useEffect } from 'react';
import { Filter, List, Grid, Download } from 'lucide-react';

export default function CalendarioPage() {
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [careerId, setCareerId] = useState<string>('');
  const [careers, setCareers] = useState<{ id: number; name: string }[]>([]);
  const [exporting, setExporting] = useState<boolean>(false);

  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const response = await fetch('/api/v1/careers');
        if (response.ok) {
          const data = await response.json();
          setCareers(data);
        }
      } catch (error) {
        console.error('Error fetching careers:', error);
      }
    };
    fetchCareers();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const query = careerId ? `?career_id=${careerId}` : '';
        const response = await fetch(`/api/v1/fusion/merged${query}`);
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, [careerId]);

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const res = await fetch('/api/v1/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          career_id: careerId ? parseInt(careerId) : null,
          format: 'pdf',
          gestion_id: 1
        })
      });
      
      if (!res.ok) throw new Error('Failed to start PDF generation');
      const data = await res.json();
      const taskId = data.task_id;
      
      const interval = setInterval(async () => {
        const statusRes = await fetch(`/api/v1/reports/${taskId}/status`);
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.status === 'completed') {
            clearInterval(interval);
            setExporting(false);
            
            const a = document.createElement('a');
            a.href = `/api/v1/reports/download/${taskId}`;
            a.download = `report_${taskId}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else if (statusData.status === 'failed') {
            clearInterval(interval);
            setExporting(false);
            alert('Error generating PDF');
          }
        }
      }, 2000);
    } catch (error) {
      console.error(error);
      setExporting(false);
      alert('Error initiating PDF export');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center glass-panel p-4 rounded-xl">
        <div className="flex gap-4 items-center">
          <Filter className="w-5 h-5 text-slate-400" />
          <select 
            className="bg-[#1e293b] border border-[var(--border)] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={careerId}
            onChange={(e) => setCareerId(e.target.value)}
          >
            <option value="">Todas las Carreras</option>
            {careers.map((career) => (
              <option key={career.id} value={career.id}>
                {career.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-4 items-center">
          <button
            className="px-3 py-1.5 rounded-md flex items-center gap-2 text-sm transition-colors bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            onClick={handleExportPDF}
            disabled={exporting}
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exportando...' : 'Export to PDF'}
          </button>
          <div className="flex bg-[#1e293b] p-1 rounded-lg border border-[var(--border)]">
            <button 
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm transition-colors ${viewMode === 'month' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setViewMode('month')}
            >
              <Grid className="w-4 h-4" />
              Mes
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
              Lista
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl min-h-[500px] flex items-center justify-center">
        <p className="text-slate-400">Vista de calendario ({viewMode}) interactivo irá aquí (ej. FullCalendar).</p>
      </div>
    </div>
  );
}
