import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Evaluación y Diagnóstico de Hábitos con IA',
  description: 'Evalúa tus hábitos actuales con nuestra inteligencia artificial y obtén un plan de acción altamente personalizado al instante.',
  alternates: {
    canonical: '/diagnosis',
  },
};

export default function DiagnosisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Ophyra Habit Diagnosis",
    "applicationCategory": "HealthApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Herramienta impulsada por IA para diagnosticar el estado actual de tus hábitos y generar un plan de acción altamente personalizado."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
