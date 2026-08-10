'use client';

import { motion } from 'framer-motion';
import { Layers, GraduationCap } from 'lucide-react';
import { CareerFacultyBreakdownItem } from '@/lib/api';

interface CareerFacultyChartProps {
  data: CareerFacultyBreakdownItem[];
}

export default function CareerFacultyChart({ data }: CareerFacultyChartProps) {
  const maxTotal = Math.max(1, ...data.map((item) => item.total));

  return (
    <div className="bg-card text-card-foreground border border-border shadow-sm p-6 rounded-2xl flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-semibold tracking-wide text-slate-300">
            Resumen por Carrera y Facultad
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {data.length} {data.length === 1 ? 'Carrera' : 'Carreras'}
        </span>
      </div>

      {data.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-sm">
          No hay datos de carreras para mostrar.
        </div>
      ) : (
        <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1">
          {data.map((item, idx) => {
            const widthPercent = (item.total / maxTotal) * 100;
            return (
              <div key={item.career_id ?? idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-slate-200">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate max-w-[180px] sm:max-w-[240px]">
                      {item.career_name}
                    </span>
                    <span className="bg-slate-800 text-slate-400 border border-slate-700/60 px-1.5 py-0.5 rounded text-[10px]">
                      {item.faculty}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                    <span>{item.total} act.</span>
                    <span className="text-emerald-400 font-semibold">
                      {item.completion_rate.toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden flex">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(3, widthPercent)}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.05 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
