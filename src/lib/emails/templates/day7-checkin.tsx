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
    subject: 'Llevas 7 días — tu progreso importa',
    title: '¡Una semana completada!',
    body: 'Llevas 7 días con tu plan Ophyra. Los primeros días son los más difíciles y ya los superaste. Sigue así — tu progreso es real.',
    cta: 'Ver mi progreso',
    footer: 'Ophyra — Tu bienestar, medido.',
  },
  en: {
    subject: "7 days in — your progress matters",
    title: 'One week down!',
    body: "You've been on your Ophyra plan for 7 days. The first days are the hardest and you've already made it. Keep going — your progress is real.",
    cta: 'See my progress',
    footer: 'Ophyra — Your wellness, measured.',
  },
};

interface Day7EmailProps {
  locale: 'es' | 'en';
  dashboardUrl: string;
}

export function getDay7Subject(locale: 'es' | 'en') {
  return copy[locale].subject;
}

export default function Day7CheckinEmail({ locale, dashboardUrl }: Day7EmailProps) {
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
