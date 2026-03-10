import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Img,
} from '@react-email/components';

const copy = {
  es: {
    subject: 'Bienvenido a Ophyra — Tu plan está activo',
    greeting: 'Hola {name},',
    body: 'Tu diagnóstico está completo y tu plan personalizado de 30 días ya está activo. Empieza hoy — cada pequeño paso cuenta.',
    cta: 'Ir a mi dashboard',
    footer: 'Ophyra — Tu bienestar, medido.',
  },
  en: {
    subject: 'Welcome to Ophyra — Your plan is active',
    greeting: 'Hi {name},',
    body: "Your diagnosis is complete and your personalized 30-day plan is now active. Start today — every small step counts.",
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
          <Img
            src="https://ophyra.com/logo.png"
            width="120"
            height="40"
            alt="Ophyra"
            style={{ margin: '0 auto 24px' }}
          />
          <Text style={heading}>{t.greeting.replace('{name}', name)}</Text>
          <Text style={paragraph}>{t.body}</Text>
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
  backgroundColor: '#0f1117',
  fontFamily: "'Space Grotesk', sans-serif",
};

const container = {
  maxWidth: '480px',
  margin: '0 auto',
  padding: '40px 24px',
};

const heading = {
  fontSize: '20px',
  fontWeight: '600' as const,
  color: '#e8e8ea',
  marginBottom: '8px',
};

const paragraph = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#a1a1aa',
};

const button = {
  backgroundColor: '#14b8a6',
  color: '#fff',
  padding: '12px 32px',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: '600' as const,
  textDecoration: 'none',
};

const hr = {
  borderColor: '#27272a',
  margin: '32px 0',
};

const footer = {
  fontSize: '12px',
  color: '#52525b',
  textAlign: 'center' as const,
};
