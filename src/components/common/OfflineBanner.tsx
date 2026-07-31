import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WifiOff, Wifi } from "lucide-react";

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setShowRestored(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowRestored(true);
      setTimeout(() => {
        setShowRestored(false);
      }, 3500);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline && !showRestored) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 py-2.5 px-4 text-center font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl ${
          isOffline
            ? "bg-red-600 text-white"
            : "bg-emerald-600 text-white"
        }`}
      >
        {isOffline ? (
          <>
            <WifiOff size={16} className="animate-pulse" />
            <span>Connection Lost — Working in Offline Mode (Auto-Retrying...)</span>
          </>
        ) : (
          <>
            <Wifi size={16} />
            <span>Connection Restored — Synced with Mellow Cloud</span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
