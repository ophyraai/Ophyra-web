import { useTranslations } from 'next-intl';
import { Instagram } from 'lucide-react';
import Link from 'next/link';

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

export default function Footer() {
  const t = useTranslations('landing.footer');

  return (
    <footer className="border-t border-ofira-card-border bg-ofira-surface1 py-12 px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <div>
          <h3 className="text-lg font-bold">{t('brand')}</h3>
          <p className="mt-1 text-sm text-ofira-text-secondary">{t('tagline')}</p>
        </div>

        <nav className="flex flex-wrap justify-center gap-6 text-sm text-ofira-text-secondary">
          <Link href="/legal/politica-de-privacidad" className="transition-colors hover:text-ofira-text">{t('privacy')}</Link>
          <Link href="/legal/terminos-y-condiciones" className="transition-colors hover:text-ofira-text">{t('terms')}</Link>
          <Link href="/legal/politica-de-cookies" className="transition-colors hover:text-ofira-text">{t('cookies')}</Link>
          <a href="mailto:ophyra.ia@gmail.com" className="transition-colors hover:text-ofira-text">{t('contact')}</a>
        </nav>

        <div className="flex gap-4 text-ofira-text-secondary">
          <a href="https://www.instagram.com/ophyra_secret/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="transition-colors hover:text-ofira-text">
            <Instagram className="size-5" />
          </a>
          <a href="https://www.tiktok.com/@ophyra_secret" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="transition-colors hover:text-ofira-text">
            <TikTokIcon className="size-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
