import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Link,
} from '@react-email/components';

const copy = {
  es: {
    subject: 'Bienvenido a Ophyra',
    greeting: 'Hola {name},',
    intro: 'Bienvenido a Ophyra. Tu cuenta ya está activa.',
    diagnosisHook: 'Hemos preparado un diagnóstico de bienestar personalizado para ti. Solo te llevará 2 minutos y descubrirás exactamente en qué áreas puedes mejorar tu día a día: sueño, alimentación, estrés, ejercicio...',
    free: 'El resultado es 100% gratuito.',
    ctaDiagnosis: 'Hacer mi diagnóstico gratis',
    shopIntro: 'Además, en nuestra tienda encontrarás productos Ophyra seleccionados para ayudarte a mejorar tu bienestar de forma real.',
    ctaShop: 'Descubrir la tienda',
    footer: 'Ophyra — Tu bienestar, medido.',
  },
  en: {
    subject: 'Welcome to Ophyra',
    greeting: 'Hi {name},',
    intro: 'Welcome to Ophyra. Your account is now active.',
    diagnosisHook: "We've prepared a personalized wellness diagnosis for you. It only takes 2 minutes and you'll discover exactly which areas you can improve in your daily life: sleep, nutrition, stress, exercise...",
    free: 'The result is 100% free.',
    ctaDiagnosis: 'Take my free diagnosis',
    shopIntro: 'Plus, in our shop you\'ll find curated Ophyra products designed to help you improve your wellness for real.',
    ctaShop: 'Discover the shop',
    footer: 'Ophyra — Your wellness, measured.',
  },
};

interface WelcomeSignupEmailProps {
  name: string;
  locale: 'es' | 'en';
  diagnosisUrl: string;
  shopUrl: string;
}

export function getWelcomeSignupSubject(locale: 'es' | 'en') {
  return copy[locale].subject;
}

export default function WelcomeSignupEmail({ name, locale, diagnosisUrl, shopUrl }: WelcomeSignupEmailProps) {
  const t = copy[locale];

  return (
    <Html lang={locale}>
      <Head />
      <Body style={body}>
        <Container style={wrapper}>
          <Container style={card}>

            {/* Logo as text */}
            <Text style={logo}>Ophyra</Text>

            {/* Greeting */}
            <Text style={heading}>{t.greeting.replace('{name}', name)}</Text>
            <Text style={paragraph}>{t.intro}</Text>

            {/* Diagnosis hook */}
            <Text style={paragraph}>{t.diagnosisHook}</Text>

            {/* Free badge */}
            <Section style={badgeWrapper}>
              <Text style={badge}>{t.free}</Text>
            </Section>

            {/* Primary CTA */}
            <Section style={ctaSection}>
              <Button style={buttonPrimary} href={diagnosisUrl}>
                {t.ctaDiagnosis}
              </Button>
            </Section>

            <Hr style={divider} />

            {/* Shop section */}
            <Text style={paragraph}>{t.shopIntro}</Text>

            <Section style={ctaSection}>
              <Link style={buttonSecondary} href={shopUrl}>
                {t.ctaShop}
              </Link>
            </Section>

            <Hr style={divider} />

            {/* Footer inside card */}
            <Text style={footerText}>{t.footer}</Text>

          </Container>
        </Container>
      </Body>
    </Html>
  );
}

// ── Styles ──

const body = {
  backgroundColor: '#f4f4f5',
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  margin: '0',
  padding: '0',
};

const wrapper = {
  maxWidth: '480px',
  margin: '0 auto',
  padding: '40px 16px',
};

const card = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '40px 32px',
  border: '1px solid #e4e4e7',
};

const logo = {
  fontSize: '24px',
  fontWeight: '700' as const,
  color: '#0d9488',
  letterSpacing: '-0.5px',
  textAlign: 'center' as const,
  margin: '0 0 32px',
};

const heading = {
  fontSize: '20px',
  fontWeight: '600' as const,
  color: '#18181b',
  margin: '0 0 12px',
};

const paragraph = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#52525b',
  margin: '0 0 16px',
};

const badgeWrapper = {
  textAlign: 'center' as const,
  margin: '8px 0 0',
};

const badge = {
  display: 'inline-block' as const,
  backgroundColor: '#ecfdf5',
  color: '#059669',
  fontSize: '14px',
  fontWeight: '600' as const,
  padding: '6px 16px',
  borderRadius: '20px',
  margin: '0',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '24px 0 0',
};

const buttonPrimary = {
  display: 'inline-block' as const,
  backgroundColor: '#0d9488',
  color: '#ffffff',
  padding: '14px 36px',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: '600' as const,
  textDecoration: 'none',
};

const buttonSecondary = {
  display: 'inline-block' as const,
  backgroundColor: '#ffffff',
  color: '#0d9488',
  padding: '12px 28px',
  borderRadius: '8px',
  border: '1.5px solid #0d9488',
  fontSize: '14px',
  fontWeight: '600' as const,
  textDecoration: 'none',
};

const divider = {
  borderColor: '#e4e4e7',
  margin: '32px 0',
};

const footerText = {
  fontSize: '12px',
  color: '#a1a1aa',
  textAlign: 'center' as const,
  margin: '0',
};
