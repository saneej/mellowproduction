import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, Info, Download, Heart, ShieldCheck, ShieldAlert, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "download" | "favorite" | "access_granted" | "access_denied";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (title: string, description?: string, type?: ToastType) => void;
  addToast: (title: string, descriptionOrType?: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((title: string, description?: string, type: ToastType = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts(prev => [...prev, { id, title, description, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const addToast = useCallback((title: string, descriptionOrType?: string, type?: ToastType) => {
    let finalDesc: string | undefined = undefined;
    let finalType: ToastType = "info";

    if (type) {
      finalDesc = descriptionOrType;
      finalType = type;
    } else if (descriptionOrType) {
      const validTypes: ToastType[] = ["success", "error", "info", "download", "favorite", "access_granted", "access_denied"];
      if (validTypes.includes(descriptionOrType as ToastType)) {
        finalType = descriptionOrType as ToastType;
      } else {
        finalDesc = descriptionOrType;
      }
    }

    showToast(title, finalDesc, finalType);
  }, [showToast]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success": return <CheckCircle2 size={18} className="text-emerald-400" />;
      case "error": return <AlertCircle size={18} className="text-red-400" />;
      case "download": return <Download size={18} className="text-brand-red animate-pulse" />;
      case "favorite": return <Heart size={18} className="text-brand-red fill-brand-red" />;
      case "access_granted": return <ShieldCheck size={18} className="text-emerald-400" />;
      case "access_denied": return <ShieldAlert size={18} className="text-red-400" />;
      default: return <Info size={18} className="text-blue-400" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, addToast }}>
      {children}

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="pointer-events-auto bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 text-white shadow-2xl flex items-start gap-3 relative overflow-hidden"
            >
              <div className="shrink-0 mt-0.5">{getIcon(toast.type)}</div>
              
              <div className="flex-1 min-w-0 pr-4">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-white">{toast.title}</h4>
                {toast.description && (
                  <p className="text-[11px] font-mono text-white/60 mt-0.5">{toast.description}</p>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>

              {/* Progress bar line */}
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 4, ease: "linear" }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-red/60"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
