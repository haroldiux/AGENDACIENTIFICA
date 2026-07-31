import { AlertTriangle, RefreshCw } from 'lucide-react';

interface AgendaErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function AgendaErrorState({ message, onRetry }: AgendaErrorStateProps) {
  return (
    <div className="glass-panel p-8 rounded-xl flex flex-col items-center text-center gap-4 min-h-[400px] justify-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-semibold text-white">No se pudo cargar la agenda</h3>
        <p className="text-slate-400 leading-relaxed">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Reintentar
      </button>
    </div>
  );
}
