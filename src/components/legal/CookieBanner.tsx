"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Retrasar mostrar el banner levemente para mejor experiencia
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie-consent', 'all');
    setShowBanner(false);
  };

  const rejectNonEssential = () => {
    localStorage.setItem('cookie-consent', 'essential');
    setShowBanner(false);
  };

  if (!isClient || !showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 sm:pb-8 pointer-events-none">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-ofira-surface2/95 backdrop-blur-md border border-ofira-card-border p-5 rounded-2xl shadow-2xl pointer-events-auto ring-1 ring-white/10 animate-in slide-in-from-bottom-5 fade-in duration-500">
        
        <div className="flex-1 flex gap-4">
          <div className="hidden sm:flex shrink-0 items-center justify-center size-10 rounded-full bg-ofira-primary/10 text-ofira-primary mt-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
              <path d="M8.5 8.5v.01" />
              <path d="M16 12.5v.01" />
              <path d="M12 16v.01" />
              <path d="M11 11v.01" />
              <path d="M15 8v.01" />
            </svg>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-ofira-text flex items-center gap-2">
              <span className="sm:hidden text-ofira-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                  <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                  <path d="M8.5 8.5v.01" />
                  <path d="M16 12.5v.01" />
                  <path d="M12 16v.01" />
                </svg>
              </span>
              Privacidad y Cookies
            </h3>
            <p className="text-sm text-ofira-text-secondary leading-relaxed pr-6 md:pr-0">
              Ophyra utiliza cookies para garantizar el funcionamiento del portal, analizar tráfico y personalizar el contenido. 
              Al hacer clic en "Aceptar todas", das tu consentimiento a nuestra <Link href="/legal/politica-de-cookies" className="text-ofira-primary hover:underline font-medium">Política de Cookies</Link>.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <button
            onClick={rejectNonEssential}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-ofira-text bg-ofira-surface1 hover:bg-ofira-surface1/80 border border-ofira-card-border rounded-xl transition-colors whitespace-nowrap"
          >
            Rechazar
          </button>
          <button
            onClick={acceptAll}
            className="flex-1 sm:flex-none px-5 py-2 text-sm font-medium text-ofira-bg bg-ofira-primary hover:bg-ofira-primary/90 rounded-xl transition-all shadow-lg hover:shadow-ofira-primary/20 hover:-translate-y-0.5 whitespace-nowrap"
          >
            Aceptar todas
          </button>
        </div>
        
        <button 
          onClick={rejectNonEssential}
          className="absolute top-3 right-3 p-1 rounded-full text-ofira-text-secondary hover:text-ofira-text hover:bg-ofira-surface1 transition-colors group"
          aria-label="Cerrar banner"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 group-hover:scale-110 transition-transform">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
