import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Button,
  Hr,
  Section,
} from '@react-email/components';

const copy = {
  es: {
    subject: 'Renueva por €4.99 — 50% de descuento',
    title: 'Tu plan ha terminado',
    body: 'Durante los últimos 30 días has trabajado en tus hábitos. No pierdas el impulso — renueva ahora con 50% de descuento y sigue mejorando.',
    price: '€4.99',
    originalPrice: '€9.99',
    discount: '50% off',
    cta: 'Renovar por €4.99',
    urgency: 'Esta oferta expira en 5 días.',
    footer: 'Ophyra — Tu bienestar, medido.',
  },
  en: {
    subject: 'Renew for €4.99 — 50% off',
    title: 'Your plan has ended',
    body: "Over the last 30 days you've worked on your habits. Don't lose momentum — renew now at 50% off and keep improving.",
    price: '€4.99',
    originalPrice: '€9.99',
    discount: '50% off',
    cta: 'Renew for €4.99',
    urgency: 'This offer expires in 5 days.',
    footer: 'Ophyra — Your wellness, measured.',
  },
};

interface RenewalOfferEmailProps {
  locale: 'es' | 'en';
  renewalUrl: string;
}

export function getRenewalOfferSubject(locale: 'es' | 'en') {
  return copy[locale].subject;
}

export default function RenewalOfferEmail({ locale, renewalUrl }: RenewalOfferEmailProps) {
  const t = copy[locale];

  return (
    <Html lang={locale}>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={logo}>Ophyra</Text>
          <Text style={heading}>{t.title}</Text>
          <Text style={paragraph}>{t.body}</Text>
          <Section style={priceBox}>
            <Text style={priceOriginal}>{t.originalPrice}</Text>
            <Text style={priceNew}>{t.price}</Text>
            <Text style={discountBadge}>{t.discount}</Text>
          </Section>
          <Section style={{ textAlign: 'center' as const, marginTop: '24px' }}>
            <Button style={button} href={renewalUrl}>
              {t.cta}
            </Button>
          </Section>
          <Text style={urgency}>{t.urgency}</Text>
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

const priceBox = {
  textAlign: 'center' as const,
  padding: '24px',
  backgroundColor: '#f4f4f5',
  borderRadius: '12px',
  marginTop: '24px',
};

const priceOriginal = {
  fontSize: '16px',
  color: '#52525b',
  textDecoration: 'line-through',
  margin: '0',
};

const priceNew = {
  fontSize: '32px',
  fontWeight: '700' as const,
  color: '#14b8a6',
  margin: '4px 0',
};

const discountBadge = {
  fontSize: '13px',
  color: '#14b8a6',
  fontWeight: '600' as const,
  margin: '0',
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

const urgency = {
  fontSize: '13px',
  color: '#f59e0b',
  textAlign: 'center' as const,
  marginTop: '16px',
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
