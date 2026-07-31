import React, { useState } from "react";
import { motion } from "motion/react";
import { Camera, ShieldCheck, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export const AdminLogin: React.FC = () => {
  const { signInWithGoogle, signInWithEmail, authError, clearAuthError } = useAuth();
  const [useEmail, setUseEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    setError("");
    clearAuthError();
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err.message && !err.message.includes("closed-by-user")) {
        setError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    clearAuthError();
    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      setError("Invalid credentials or unauthorized admin email.");
    } finally {
      setLoading(false);
    }
  };

  const displayError = authError || error;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-between p-6 text-white relative overflow-hidden">
      {/* Background Decorative Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(185,0,3,0.15)_0%,transparent_70%)] pointer-events-none" />

      <div className="w-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl p-8 space-y-8 shadow-2xl relative z-10 my-auto"
      >
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <img 
            src="https://i.postimg.cc/j250f7G7/logo-white.png" 
            alt="Mellow Production" 
            className="w-14 h-11 mx-auto object-contain"
          />
          <h2 className="text-2xl font-display font-extrabold uppercase tracking-tight">
            Mellow <span className="text-brand-red font-light">Admin</span>
          </h2>
          <p className="text-xs font-mono text-white/50 tracking-wider">
            Role-Based Admin Control Panel
          </p>
        </div>

        {displayError && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400 font-mono text-center space-y-1">
            <div className="font-bold uppercase tracking-wider text-[10px]">Authentication Failed</div>
            <div>{displayError}</div>
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-2xl bg-white text-black font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-3 hover:bg-white/90 transition-all shadow-xl disabled:opacity-50 group"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.42l4.01-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{loading ? "Authenticating..." : "Continue with Google"}</span>
        </button>

        <div className="flex items-center gap-4 text-xs text-white/30 font-mono my-4">
          <div className="flex-1 h-px bg-white/10" />
          <span>OR EMAIL LOGIN</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Email Form */}
        {!useEmail ? (
          <button
            onClick={() => setUseEmail(true)}
            className="w-full py-3 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <Mail size={16} />
            <span>Sign in with Email & Password</span>
          </button>
        ) : (
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-white/50 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="msaneejk4@gmail.com"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-white/50 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl bg-brand-red text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:bg-brand-red/90 transition-colors shadow-xl"
            >
              <span>{loading ? "Signing in..." : "Sign In"}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] text-center font-mono text-white/50 leading-relaxed">
          <strong>Need Admin Access?</strong> Ask the System Owner (Saneej) to add your Gmail address in the Admin Users Panel.
        </div>
      </motion.div>

      {/* Footer */}
      <div className="w-full text-center py-4 text-xs font-mono text-white/40 z-10">
        Developed by <a href="https://instagram.com/heysaneej" target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-red underline">saneejified</a>
      </div>
    </div>
  );
};
