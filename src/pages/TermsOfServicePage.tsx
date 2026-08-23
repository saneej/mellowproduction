import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Shield, Scale, Mail, Instagram } from "lucide-react";

export const TermsOfServicePage: React.FC = () => {
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
            <Scale size={14} />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold uppercase tracking-tight text-white">
            Terms of Service
          </h1>
          <p className="text-sm text-white/60 font-mono">
            Last updated: August 23, 2026 • Mellow Production ("we", "our", or "us")
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-brand-red">
            <FileText size={22} />
            <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">1. Acceptance of Terms</h2>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">
            By accessing or using the Mellow Production web application, client photo galleries, and associated services, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-brand-red">
            <Shield size={22} />
            <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">2. Use of Services & Google Drive Integration</h2>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">
            Our platform provides media management and client gallery hosting, including optional integration with Google Drive storage. You agree to use these services only for lawful photography and videography business purposes. When linking Google Drive folders, you confirm that you have all necessary rights to access, sync, and display the media files contained therein.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-brand-red">
            <Scale size={22} />
            <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">3. Intellectual Property</h2>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">
            All photographs, videos, design layouts, logos, and software code presented on Mellow Production are protected by copyright and intellectual property laws. Clients and guests may download or favorite images for personal use as permitted by event organizers, but commercial reproduction or redistribution without explicit written consent is strictly prohibited.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-brand-red">
            <FileText size={22} />
            <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">4. Limitation of Liability</h2>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">
            Mellow Production provides its web application on an "as is" and "as available" basis. While we strive for high uptime and robust security, we are not liable for temporary service interruptions, third-party API outages (such as Google Drive or Firebase), or data loss resulting from unauthorized external actions.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-brand-red">
            <Mail size={22} />
            <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">5. Contact Information</h2>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">
            For any questions or inquiries regarding these Terms of Service, please contact us at:
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
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
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
