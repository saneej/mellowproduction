import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something Went Wrong",
  message = "An unexpected error occurred while communicating with Mellow servers.",
  onRetry,
  onGoHome = () => window.location.href = "/"
}) => {
  return (
    <div className="p-8 text-center bg-red-950/20 border border-red-500/30 rounded-3xl space-y-6 max-w-md mx-auto my-12 shadow-2xl backdrop-blur-md">
      <div className="w-16 h-16 mx-auto rounded-3xl bg-red-500/10 border border-red-500/40 text-red-400 flex items-center justify-center animate-pulse">
        <AlertTriangle size={32} />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-display font-extrabold uppercase tracking-tight text-white">{title}</h3>
        <p className="text-xs font-mono text-white/60 leading-relaxed">{message}</p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="py-3 px-5 rounded-2xl bg-brand-red text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-brand-red/90 transition-all shadow-lg active:scale-95"
          >
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>
        )}

        {onGoHome && (
          <button
            onClick={onGoHome}
            className="py-3 px-5 rounded-2xl bg-white/10 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-white/20 transition-all border border-white/10 active:scale-95"
          >
            <Home size={14} />
            <span>Return Home</span>
          </button>
        )}
      </div>
    </div>
  );
};
