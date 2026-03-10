import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tienda Oficial | Ophyra', // TODO: Renombrar si se desea la marca personal aquí
  description: 'Descubre nuestros productos, plantillas y herramientas para optimizar tus hábitos y maximizar tu productividad diaria.',
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    title: 'Tienda Oficial | Ophyra',
    description: 'Productos, plantillas y herramientas para optimizar tus hábitos.',
    url: '/shop',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tienda Oficial | Ophyra',
    description: 'Descubre nuestras herramientas para optimizar tu día a día.',
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
