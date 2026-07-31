import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, ArrowRight, ShieldAlert, CheckSquare, Square } from "lucide-react";
import { AccessCode } from "../../types/gallery";
import { checkRateLimit, recordAttempt } from "../../lib/rateLimiter";
import { accessCodeSchema } from "../../lib/validation";

interface PinModalProps {
  isOpen: boolean;
  correctPin?: string;
  projectTitle: string;
  coverImage?: string;
  accessCodes?: AccessCode[];
  projectId?: string;
  onSuccess: (codePermissions?: AccessCode['permissions'], enteredCode?: string) => void;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  correctPin = "2026",
  projectTitle,
  coverImage,
  accessCodes = [],
  projectId = "default",
  onSuccess
}) => {
  const [pin, setPin] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rememberDevice, setRememberDevice] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = pin.trim();

    // Rate limiting check
    const rateLimitKey = `pin_attempt_${projectId}`;
    const rateCheck = checkRateLimit(rateLimitKey, 5, 60000, 300000);
    if (!rateCheck.allowed) {
      setErrorMessage(rateCheck.message || "Too many attempts. Locked out for 5 minutes.");
      return;
    }

    // Zod validation
    const validationResult = accessCodeSchema.safeParse({ pin: cleanInput });
    if (!validationResult.success) {
      setErrorMessage(validationResult.error.issues[0]?.message || "Invalid format");
      return;
    }

    // 1. Check master PIN fallback
    if (cleanInput === correctPin || cleanInput === "2026") {
      recordAttempt(rateLimitKey, true);
      if (rememberDevice) {
        localStorage.setItem(`mellow_unlocked_${projectId}`, JSON.stringify({
          unlockedAt: new Date().toISOString(),
          code: cleanInput,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        }));
      }
      setErrorMessage(null);
      onSuccess({
        canView: true,
        canDownload: true,
        canFavorite: true,
        downloadOriginalQuality: true,
        downloadZip: true
      }, cleanInput);
      return;
    }

    // 2. Check Access Codes list
    const matchedCode = accessCodes.find(ac => (ac.code || "").trim().toLowerCase() === cleanInput.toLowerCase());

    if (matchedCode) {
      if (!matchedCode.enabled) {
        recordAttempt(rateLimitKey, false);
        setErrorMessage("Access code has been disabled.");
        setPin("");
        return;
      }

      if (matchedCode.expirationDate && new Date(matchedCode.expirationDate) < new Date()) {
        recordAttempt(rateLimitKey, false);
        setErrorMessage("Access code has expired.");
        setPin("");
        return;
      }

      if (matchedCode.maxUses && matchedCode.maxUses > 0 && (matchedCode.usedCount || 0) >= matchedCode.maxUses) {
        recordAttempt(rateLimitKey, false);
        setErrorMessage("Usage limit reached.");
        setPin("");
        return;
      }

      // Valid Access Code
      recordAttempt(rateLimitKey, true);
      if (rememberDevice) {
        localStorage.setItem(`mellow_unlocked_${projectId}`, JSON.stringify({
          unlockedAt: new Date().toISOString(),
          codeName: matchedCode.name,
          code: cleanInput,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }));
      }

      setErrorMessage(null);
      onSuccess(matchedCode.permissions, cleanInput);
      return;
    }

    // 3. Invalid code
    recordAttempt(rateLimitKey, false);
    setErrorMessage("Incorrect access code.");
    setPin("");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 select-none">
        
        {/* Background Cover Preview blur if available */}
        {coverImage && (
          <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
            <img src={coverImage} alt="Cover" className="w-full h-full object-cover filter blur-3xl scale-110" />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-sm bg-zinc-950 border border-white/10 rounded-2xl p-8 text-white space-y-6 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-[0.25em] text-white/50">ACCESS CODE REQUIRED</h3>
            <p className="text-xl font-bold tracking-tight text-white uppercase font-display">
              {projectTitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={16}
                value={pin}
                onChange={e => {
                  setErrorMessage(null);
                  setPin(e.target.value);
                }}
                placeholder="ENTER ACCESS CODE"
                autoFocus
                className={`w-full text-center text-lg tracking-widest bg-white/5 border rounded-xl px-4 py-3.5 text-white font-mono placeholder:text-white/20 uppercase focus:outline-none transition-all ${
                  errorMessage ? "border-red-500 bg-red-500/10" : "border-white/10 focus:border-white/30"
                }`}
              />
              {errorMessage && (
                <p className="mt-2 text-xs text-red-400 flex items-center justify-center gap-1.5 font-mono">
                  <ShieldAlert size={12} className="shrink-0" />
                  <span>{errorMessage}</span>
                </p>
              )}
            </div>

            {/* Remember Device Checkbox */}
            <div 
              onClick={() => setRememberDevice(!rememberDevice)}
              className="flex items-center justify-center gap-2 text-xs font-mono text-white/40 hover:text-white/70 cursor-pointer select-none py-1 transition-colors"
            >
              {rememberDevice ? (
                <CheckSquare size={14} className="text-white/80" />
              ) : (
                <Square size={14} className="text-white/20" />
              )}
              <span>Remember this device</span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-white text-zinc-950 font-semibold uppercase tracking-widest text-[10px] sm:text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all font-mono"
            >
              <span>ACCESS GALLERY</span>
              <ArrowRight size={14} />
            </button>
          </form>

          <div className="pt-4 border-t border-white/5 flex flex-col items-center justify-center gap-1">
            <p className="text-[10px] text-white/30 font-mono tracking-wider">
              MELLOW PRODUCTION
            </p>
            <p className="text-[8px] text-white/15 font-mono">
              PIN: 2026
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

