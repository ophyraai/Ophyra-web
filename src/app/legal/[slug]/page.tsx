import fs from 'fs/promises';
import path from 'path';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/landing/Footer'; // Importar el footer global
import MarkdownRenderer from '@/components/legal/MarkdownRenderer';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const titleMap: Record<string, string> = {
    'terminos-y-condiciones': 'Términos y Condiciones',
    'politica-de-privacidad': 'Política de Privacidad',
    'politica-de-cookies': 'Política de Cookies',
    'politica-de-envios': 'Política de Envíos',
    'politica-de-devoluciones': 'Política de Devoluciones',
    'aviso-de-afiliacion': 'Aviso de Afiliación',
    'aviso-legal': 'Aviso Legal',
  };

  return {
    title: `${titleMap[params.slug] || 'Legal'} - Ophyra`,
    description: 'Documentación legal de Ophyra.'
  };
}

export default async function LegalPage(props: Props) {
  const params = await props.params;
  const { slug } = params;
  
  const validSlugs = [
    'terminos-y-condiciones',
    'politica-de-privacidad',
    'politica-de-cookies',
    'politica-de-envios',
    'politica-de-devoluciones',
    'aviso-de-afiliacion',
    'aviso-legal',
  ];
  if (!validSlugs.includes(slug)) {
    notFound();
  }

  const filePath = path.join(process.cwd(), 'legal', `${slug}.md`);
  let content = '';
  try {
    content = await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-ofira-bg flex flex-col pt-12">
      <div className="flex-1 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full mb-16 relative">
        <div className="mb-6 animate-in slide-in-from-left-4 fade-in duration-500">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-ofira-text-secondary hover:text-ofira-primary transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 size-4">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Volver al Inicio
            </Link>
        </div>

        <div className="bg-ofira-surface1 p-6 md:p-10 rounded-2xl border border-ofira-card-border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="max-w-none">
            <MarkdownRenderer content={content} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
