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
    subject: 'Tienes hábitos pendientes hoy',
    greeting: 'Hola {name},',
    body: 'Tienes {count} hábitos pendientes hoy. No pierdas tu racha — cada día cuenta.',
    cta: 'Completar mis hábitos',
    footer: 'Ophyra — Tu bienestar, medido.',
    unsubscribe: 'Puedes desactivar los recordatorios desde tu dashboard.',
  },
  en: {
    subject: "You have pending habits today",
    greeting: 'Hi {name},',
    body: "You have {count} pending habits today. Don't break your streak — every day counts.",
    cta: 'Complete my habits',
    footer: 'Ophyra — Your wellness, measured.',
    unsubscribe: 'You can disable reminders from your dashboard.',
  },
};

interface DailyReminderEmailProps {
  name: string;
  locale: 'es' | 'en';
  pendingCount: number;
  dashboardUrl: string;
}

export function getDailyReminderSubject(locale: 'es' | 'en') {
  return copy[locale].subject;
}

export default function DailyReminderEmail({ name, locale, pendingCount, dashboardUrl }: DailyReminderEmailProps) {
  const t = copy[locale];

  return (
    <Html lang={locale}>
      <Head />
      <Body style={body}>
        <Container style={wrapper}>
          <Container style={card}>
            <Text style={logo}>Ophyra</Text>
            <Text style={heading}>{t.greeting.replace('{name}', name)}</Text>
            <Text style={paragraph}>
              {t.body.replace('{count}', String(pendingCount))}
            </Text>
            <Section style={ctaSection}>
              <Button style={buttonPrimary} href={dashboardUrl}>
                {t.cta}
              </Button>
            </Section>
            <Hr style={divider} />
            <Text style={footerText}>{t.footer}</Text>
            <Text style={unsubscribeText}>{t.unsubscribe}</Text>
          </Container>
        </Container>
      </Body>
    </Html>
  );
}

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

const divider = {
  borderColor: '#e4e4e7',
  margin: '32px 0',
};

const footerText = {
  fontSize: '12px',
  color: '#a1a1aa',
  textAlign: 'center' as const,
  margin: '0 0 8px',
};

const unsubscribeText = {
  fontSize: '11px',
  color: '#d4d4d8',
  textAlign: 'center' as const,
  margin: '0',
};
