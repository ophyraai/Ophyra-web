import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components';

const copy = {
  es: {
    subject: 'Tu plan de 30 días está activo',
    greeting: 'Hola {name},',
    body: 'Tu plan personalizado de 30 días ya está activo. Tienes acceso al análisis detallado de tus 6 áreas, acciones prioritarias y seguimiento diario de hábitos.',
    motivate: 'Empieza hoy — cada pequeño paso cuenta.',
    cta: 'Ir a mi dashboard',
    footer: 'Ophyra — Tu bienestar, medido.',
  },
  en: {
    subject: 'Your 30-day plan is active',
    greeting: 'Hi {name},',
    body: 'Your personalized 30-day plan is now active. You have access to the detailed analysis of your 6 areas, priority actions, and daily habit tracking.',
    motivate: 'Start today — every small step counts.',
    cta: 'Go to my dashboard',
    footer: 'Ophyra — Your wellness, measured.',
  },
};

interface WelcomeEmailProps {
  name: string;
  locale: 'es' | 'en';
  dashboardUrl: string;
}

export function getWelcomeSubject(locale: 'es' | 'en') {
  return copy[locale].subject;
}

export default function WelcomeEmail({ name, locale, dashboardUrl }: WelcomeEmailProps) {
  const t = copy[locale];

  return (
    <Html lang={locale}>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={logo}>Ophyra</Text>
          <Text style={heading}>{t.greeting.replace('{name}', name)}</Text>
          <Text style={paragraph}>{t.body}</Text>
          <Text style={motivate}>{t.motivate}</Text>
          <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
            <Button style={button} href={dashboardUrl}>
              {t.cta}
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>{t.footer}</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f4f4f5',
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const container = {
  maxWidth: '480px',
  margin: '0 auto',
  padding: '40px 24px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
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
  marginBottom: '8px',
};

const paragraph = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#52525b',
};

const button = {
  backgroundColor: '#0d9488',
  color: '#fff',
  padding: '12px 32px',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: '600' as const,
  textDecoration: 'none',
};

const motivate = {
  fontSize: '15px',
  fontWeight: '600' as const,
  color: '#14b8a6',
  lineHeight: '1.6',
};

const hr = {
  borderColor: '#e4e4e7',
  margin: '32px 0',
};

const footer = {
  fontSize: '12px',
  color: '#a1a1aa',
  textAlign: 'center' as const,
};
