import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop de bienestar · Ophyra',
  description:
    'Productos y herramientas seleccionadas para mejorar tus hábitos: sueño, nutrición, movimiento, mente, energía y entorno. Marca Ophyra + productos recomendados.',
  alternates: { canonical: '/shop' },
  openGraph: {
    title: 'Shop de bienestar · Ophyra',
    description:
      'Productos curados por Ophyra para los 6 pilares del bienestar: sueño, nutrición, movimiento, mente, energía y entorno.',
    url: '/shop',
    type: 'website',
    siteName: 'Ophyra',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop de bienestar · Ophyra',
    description:
      'Productos curados para mejorar tus hábitos de bienestar.',
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
