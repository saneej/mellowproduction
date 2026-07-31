import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, ArrowRight, ShieldAlert, CheckSquare, Square, ShieldCheck } from "lucide-react";
import { AccessCode, Project } from "../../types/gallery";
import { checkRateLimit, recordAttempt } from "../../lib/rateLimiter";
import { accessCodeSchema } from "../../lib/validation";

interface PinModalProps {
  isOpen: boolean;
  correctPin?: string;
  projectTitle: string;
  coverImage?: string;
  accessCodes?: AccessCode[];
  projectId?: string;
  onSuccess: (codePermissions?: AccessCode['permissions']) => void;
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
      setErrorMessage(validationResult.error.issues[0]?.message || "Invalid input format");
      return;
    }

    // 1. Check master PIN fallback
    if (cleanInput === correctPin || cleanInput === "2026") {
      recordAttempt(rateLimitKey, true);
      if (rememberDevice) {
        localStorage.setItem(`mellow_unlocked_${projectId}`, JSON.stringify({
          unlockedAt: new Date().toISOString(),
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
      });
      return;
    }

    // 2. Check Access Codes list
    const matchedCode = accessCodes.find(ac => (ac.code || "").trim().toLowerCase() === cleanInput.toLowerCase());

    if (matchedCode) {
      if (!matchedCode.enabled) {
        recordAttempt(rateLimitKey, false);
        setErrorMessage("This access code has been disabled.");
        setPin("");
        return;
      }

      if (matchedCode.expirationDate && new Date(matchedCode.expirationDate) < new Date()) {
        recordAttempt(rateLimitKey, false);
        setErrorMessage("This access code has expired.");
        setPin("");
        return;
      }

      if (matchedCode.maxUses && matchedCode.maxUses > 0 && (matchedCode.usedCount || 0) >= matchedCode.maxUses) {
        recordAttempt(rateLimitKey, false);
        setErrorMessage("Maximum usage limit reached for this access code.");
        setPin("");
        return;
      }

      // Valid Access Code
      recordAttempt(rateLimitKey, true);
      if (rememberDevice) {
        localStorage.setItem(`mellow_unlocked_${projectId}`, JSON.stringify({
          unlockedAt: new Date().toISOString(),
          codeName: matchedCode.name,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }));
      }

      setErrorMessage(null);
      onSuccess(matchedCode.permissions);
      return;
    }

    // 3. Invalid code
    recordAttempt(rateLimitKey, false);
    setErrorMessage("Invalid access code. Please check and try again.");
    setPin("");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 select-none">
        
        {/* Background Cover Preview blur if available */}
        {coverImage && (
          <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
            <img src={coverImage} alt="Cover" className="w-full h-full object-cover filter blur-3xl scale-110" />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-zinc-950/90 border border-white/10 rounded-3xl p-8 text-white space-y-6 text-center shadow-2xl relative overflow-hidden backdrop-blur-xl"
        >
          {/* Top Cover / Decorative Badge */}
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-red/10 border border-brand-red/30 text-brand-red flex items-center justify-center shadow-inner">
            <Lock size={28} />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-display font-extrabold uppercase tracking-tight">Protected Client Gallery</h3>
            <p className="text-xs font-mono text-white/50 tracking-wider">
              Enter Access Code for <span className="text-white font-bold">{projectTitle}</span>
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
                placeholder="Access Code or PIN"
                autoFocus
                className={`w-full text-center text-xl tracking-widest bg-white/5 border rounded-2xl px-4 py-3.5 text-white font-mono placeholder:text-white/20 uppercase focus:outline-none transition-all ${
                  errorMessage ? "border-red-500 bg-red-500/10" : "border-white/15 focus:border-brand-red"
                }`}
              />
              {errorMessage && (
                <p className="mt-2 text-xs text-red-400 flex items-center justify-center gap-1.5 font-mono">
                  <ShieldAlert size={14} className="shrink-0" />
                  <span>{errorMessage}</span>
                </p>
              )}
            </div>

            {/* Remember Device Checkbox */}
            <div 
              onClick={() => setRememberDevice(!rememberDevice)}
              className="flex items-center justify-center gap-2 text-xs font-mono text-white/60 hover:text-white cursor-pointer select-none py-1"
            >
              {rememberDevice ? (
                <CheckSquare size={16} className="text-brand-red" />
              ) : (
                <Square size={16} className="text-white/30" />
              )}
              <span>Remember this device for 30 days</span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-brand-red text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:bg-brand-red/90 transition-all shadow-xl"
            >
              <ShieldCheck size={16} />
              <span>Continue to Gallery</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="pt-2 border-t border-white/5 space-y-1">
            <p className="text-[11px] text-white/40 font-mono">
              Exclusive Client Access System by Mellow Production
            </p>
            <p className="text-[10px] text-white/20 font-mono">
              Default Access PIN: <span className="font-bold text-white/40">2026</span>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
