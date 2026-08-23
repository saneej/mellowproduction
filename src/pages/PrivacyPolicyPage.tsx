import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, Server, RefreshCw, Mail, Instagram } from "lucide-react";

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-red selection:text-white font-mono">
      {/* Top Bar */}
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-white hover:text-brand-red transition-colors group">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-brand-red transition-colors">
              <ArrowLeft size={16} />
            </div>
            <span className="text-xs uppercase tracking-widest font-bold">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <img 
              src="https://i.postimg.cc/j250f7G7/logo-white.png" 
              alt="Mellow Production" 
              className="h-6 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        {/* Title Section */}
        <div className="space-y-4 border-b border-white/10 pb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-red/20 text-brand-red border border-brand-red/30 text-xs font-bold uppercase tracking-wider">
            <Shield size={14} />
            <span>Legal & Data Protection</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold uppercase tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-sm text-white/60 font-mono">
            Last updated: August 23, 2026 • Mellow Production ("we", "our", or "us")
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-brand-red">
            <Eye size={22} />
            <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">1. Introduction</h2>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">
            Mellow Production respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard information when you use our web application, client portals, photography galleries, and Google Drive integration services.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-brand-red">
            <Server size={22} />
            <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">2. Information We Collect</h2>
          </div>
          <ul className="list-disc pl-5 space-y-2 text-sm text-white/80 leading-relaxed">
            <li><strong className="text-white">Account & Authentication Data:</strong> When administrators sign in with Google or access admin controls, we securely authenticate via Firebase Auth.</li>
            <li><strong className="text-white">Google Drive Integration Data:</strong> With your explicit consent, we access authorized Google Drive folder IDs and retrieve media metadata (photos, videos, folder hierarchies) solely for the purpose of displaying your event galleries to clients and guests.</li>
            <li><strong className="text-white">Client & Guest Interactions:</strong> Favorites, downloads, and inquiry details submitted through our contact forms or client portals.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-brand-red">
            <RefreshCw size={22} />
            <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">3. How We Use Your Information</h2>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">
            We use the collected information exclusively to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-white/80 leading-relaxed">
            <li>Render high-resolution photography and videography galleries for your wedding or commercial events.</li>
            <li>Synchronize event folders and media assets seamlessly from your connected Google Drive storage.</li>
            <li>Secure access to private galleries using password protection and unique access codes.</li>
          </ul>
        </section>

        {/* Section 4 - Google API Compliance */}
        <section className="space-y-4 p-6 rounded-3xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 text-amber-400">
            <Lock size={22} />
            <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">4. Google API Services Disclosure (Limited Use)</h2>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">
            Mellow Production's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-brand-red underline hover:text-white">Google API Services User Data Policy</a>, including the <strong className="text-white">Limited Use</strong> requirements. We do not sell or share Google Drive data with third-party advertisers or AI model trainers.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-brand-red">
            <Shield size={22} />
            <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">5. Data Security & Retention</h2>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">
            All data transmissions are encrypted via SSL/TLS. Persistent records are securely housed in Firebase Firestore with stringent security rules. You retain full ownership of your media assets stored in Google Drive, and access tokens can be revoked at any time.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-brand-red">
            <Mail size={22} />
            <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">6. Contact Us</h2>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">
            If you have any questions or concerns regarding this Privacy Policy or your data, please contact us at:
          </p>
          <div className="p-4 rounded-2xl bg-black border border-white/10 text-xs text-white/70 space-y-1">
            <div><strong className="text-white">Mellow Production</strong></div>
            <div>Email: <a href="mailto:msaneejk4@gmail.com" className="text-brand-red hover:underline">msaneejk4@gmail.com</a></div>
            <div>Instagram: <a href="https://www.instagram.com/mellow.production_/" target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">@mellow.production_</a></div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/10 py-10 px-6 text-center text-xs text-white/50 space-y-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} Mellow Production. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <div className="flex items-center gap-2">
              <span>Developed by</span>
              <a 
                href="https://instagram.com/heysaneej" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-white hover:text-brand-red transition-colors"
              >
                <Instagram size={13} className="text-brand-red" />
                <span>saneejified</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
