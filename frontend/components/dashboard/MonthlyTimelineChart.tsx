'use client';

import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { MonthlyTimelineItem } from '@/lib/api';

interface MonthlyTimelineChartProps {
  data: MonthlyTimelineItem[];
}

const monthNames = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

export default function MonthlyTimelineChart({ data }: MonthlyTimelineChartProps) {
  const maxVal = Math.max(
    1,
    ...data.map((item) => Math.max(item.academic_count, item.scientific_count))
  );

  return (
    <div className="bg-card text-card-foreground border border-border shadow-sm p-6 rounded-2xl flex flex-col justify-between space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-violet-400" />
          <h3 className="text-sm font-semibold tracking-wide text-slate-300">
            Distribución Mensual de Actividades
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
            <span className="text-slate-400">Académicas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-violet-500 inline-block" />
            <span className="text-slate-400">Científicas</span>
          </div>
        </div>
      </div>

      <div className="h-52 w-full pt-6 flex items-end justify-between gap-1.5 sm:gap-2">
        {data.map((item) => {
          const acadHeightPercent = (item.academic_count / maxVal) * 100;
          const sciHeightPercent = (item.scientific_count / maxVal) * 100;

          return (
            <div
              key={item.month}
              className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
            >
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 border border-slate-700 text-slate-200 text-[10px] p-1.5 rounded-md shadow-lg pointer-events-none z-10 whitespace-nowrap">
                <p className="font-semibold text-slate-300">{monthNames[item.month - 1]}</p>
                <p className="text-blue-400">Acad: {item.academic_count}</p>
                <p className="text-violet-400">Cient: {item.scientific_count}</p>
              </div>

              {/* Bars container */}
              <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-36">
                {/* Academic Bar */}
                <motion.div
                  className="w-1/2 max-w-[12px] bg-blue-500/80 group-hover:bg-blue-400 rounded-t-sm"
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(4, acadHeightPercent)}%` }}
                  transition={{ duration: 0.8, delay: item.month * 0.03 }}
                />
                {/* Scientific Bar */}
                <motion.div
                  className="w-1/2 max-w-[12px] bg-violet-500/80 group-hover:bg-violet-400 rounded-t-sm"
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(4, sciHeightPercent)}%` }}
                  transition={{ duration: 0.8, delay: item.month * 0.03 + 0.1 }}
                />
              </div>

              {/* Month label */}
              <span className="text-[11px] font-medium text-slate-400 mt-1">
                {monthNames[item.month - 1]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
