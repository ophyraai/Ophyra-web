import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Button,
  Hr,
  Img,
  Section,
} from '@react-email/components';

const copy = {
  es: {
    subject: 'Tu re-diagnóstico gratis te espera',
    title: '25 días completados 🎯',
    body: 'Faltan 5 días para que termine tu plan. Tienes un re-diagnóstico gratuito incluido — descubre cuánto has mejorado y compara tus resultados.',
    cta: 'Hacer mi re-diagnóstico',
    footer: 'Ophyra — Tu bienestar, medido.',
  },
  en: {
    subject: 'Your free re-diagnosis is waiting',
    title: '25 days completed 🎯',
    body: "5 days left on your plan. You have a free re-diagnosis included — discover how much you've improved and compare your results.",
    cta: 'Take my re-diagnosis',
    footer: 'Ophyra — Your wellness, measured.',
  },
};

interface Day25EmailProps {
  locale: 'es' | 'en';
  diagnosisUrl: string;
}

export function getDay25Subject(locale: 'es' | 'en') {
  return copy[locale].subject;
}

export default function Day25RediagnosisEmail({ locale, diagnosisUrl }: Day25EmailProps) {
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
          <Text style={heading}>{t.title}</Text>
          <Text style={paragraph}>{t.body}</Text>
          <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
            <Button style={button} href={diagnosisUrl}>
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
