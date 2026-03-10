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
    subject: 'Última oportunidad — €4.99 antes de que expire',
    title: '⏰ Última oportunidad',
    body: 'Tu oferta de renovación al 50% expira mañana. Después, el precio vuelve a €9.99. No dejes que tu progreso se pierda.',
    price: '€4.99',
    cta: 'Renovar ahora por €4.99',
    urgency: 'Oferta válida hasta mañana.',
    footer: 'Ophyra — Tu bienestar, medido.',
  },
  en: {
    subject: 'Last chance — €4.99 before it expires',
    title: '⏰ Last chance',
    body: "Your 50% renewal offer expires tomorrow. After that, the price goes back to €9.99. Don't let your progress slip away.",
    price: '€4.99',
    cta: 'Renew now for €4.99',
    urgency: 'Offer valid until tomorrow.',
    footer: 'Ophyra — Your wellness, measured.',
  },
};

interface RenewalLastChanceEmailProps {
  locale: 'es' | 'en';
  renewalUrl: string;
}

export function getRenewalLastChanceSubject(locale: 'es' | 'en') {
  return copy[locale].subject;
}

export default function RenewalLastChanceEmail({ locale, renewalUrl }: RenewalLastChanceEmailProps) {
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
          <Section style={priceBox}>
            <Text style={priceNew}>{t.price}</Text>
          </Section>
          <Section style={{ textAlign: 'center' as const, marginTop: '24px' }}>
            <Button style={button} href={renewalUrl}>
              {t.cta}
            </Button>
          </Section>
          <Text style={urgencyText}>{t.urgency}</Text>
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
  fontSize: '22px',
  fontWeight: '700' as const,
  color: '#e8e8ea',
  marginBottom: '8px',
};

const paragraph = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#a1a1aa',
};

const priceBox = {
  textAlign: 'center' as const,
  padding: '20px',
  backgroundColor: '#18181b',
  borderRadius: '12px',
  border: '1px solid #f59e0b',
  marginTop: '24px',
};

const priceNew = {
  fontSize: '32px',
  fontWeight: '700' as const,
  color: '#14b8a6',
  margin: '0',
};

const button = {
  backgroundColor: '#f59e0b',
  color: '#000',
  padding: '14px 36px',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: '700' as const,
  textDecoration: 'none',
};

const urgencyText = {
  fontSize: '13px',
  color: '#ef4444',
  textAlign: 'center' as const,
  marginTop: '16px',
  fontWeight: '600' as const,
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
