'use client';

import { motion } from 'framer-motion';
import { Target, CheckCircle2 } from 'lucide-react';

interface ExecutionGaugeProps {
  rate: number;
  completed: number;
  total: number;
}

export default function ExecutionGauge({ rate, completed, total }: ExecutionGaugeProps) {
  const normalizedRate = Math.min(100, Math.max(0, rate));
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedRate / 100) * circumference;

  const getColor = (val: number) => {
    if (val >= 75) return '#10b981'; // Emerald
    if (val >= 50) return '#3b82f6'; // Blue
    if (val >= 25) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const currentColor = getColor(normalizedRate);

  return (
    <div className="rounded-2xl border border-white/6 bg-slate-900/60 backdrop-blur-sm shadow-xl p-0 flex flex-col relative overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-wide text-slate-200 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          Tasa de Ejecución
        </span>
        <span className="text-xs text-slate-500">Meta Institucional</span>
      </div>

      <div className="relative flex items-center justify-center my-4 flex-1">
        <svg className="w-48 h-48 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="14"
            fill="transparent"
            className="text-slate-800/80"
          />
          {/* Progress circle */}
          <motion.circle
            cx="96"
            cy="96"
            r={radius}
            stroke={currentColor}
            strokeWidth="14"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: currentColor }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {normalizedRate.toFixed(1)}%
          </motion.span>
          <span className="text-xs font-medium text-slate-400 mt-0.5">Completado</span>
        </div>
      </div>

      <div className="w-full grid grid-cols-2 gap-2 p-5 border-t border-white/5 text-center">
        <div className="bg-slate-900/40 p-2 rounded-xl">
          <p className="text-xs text-slate-400">Completadas</p>
          <p className="text-base font-bold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {completed}
          </p>
        </div>
        <div className="bg-slate-900/40 p-2 rounded-xl">
          <p className="text-xs text-slate-400">Total Programadas</p>
          <p className="text-base font-bold text-slate-200 mt-0.5">{total}</p>
        </div>
      </div>
    </div>
  );
}
