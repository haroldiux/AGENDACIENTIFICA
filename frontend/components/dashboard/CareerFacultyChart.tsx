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
    <div className="rounded-2xl border border-border bg-surface shadow-[var(--shadow-glass)] p-0 flex flex-col justify-between dark:bg-surface/80 dark:backdrop-blur-sm dark:border-white/6">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Layers className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold tracking-wide text-foreground">
            Resumen por Carrera y Facultad
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {data.length} {data.length === 1 ? 'Carrera' : 'Carreras'}
        </span>
      </div>

      {data.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground text-sm">
          No hay datos de carreras para mostrar.
        </div>
      ) : (
        <div className="p-5 space-y-4 max-h-[320px] overflow-y-auto">
          {data.map((item, idx) => {
            const widthPercent = (item.total / maxTotal) * 100;
            return (
              <div key={item.career_id ?? idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                    <span className="truncate max-w-[180px] sm:max-w-[240px]">
                      {item.career_name}
                    </span>
                    <span className="bg-muted text-muted-foreground border border-border px-1.5 py-0.5 rounded text-[10px]">
                      {item.faculty}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground font-mono text-[11px]">
                    <span>{item.total} act.</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {item.completion_rate.toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden flex">
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
