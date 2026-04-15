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
    subject: '📦 Tu pedido #{shortId} está en camino',
    greeting: '¡Buenas noticias, {name}!',
    body: 'Tu pedido ya está en manos del transportista y va camino a ti.',
    trackingLabel: 'Número de seguimiento:',
    carrierLabel: 'Transportista:',
    ctaTracking: 'Seguir mi envío',
    ctaOrder: 'Ver detalles del pedido',
    footer: 'Ophyra — Tu bienestar, medido.',
  },
  en: {
    subject: '📦 Your order #{shortId} is on its way',
    greeting: 'Good news, {name}!',
    body: 'Your order has been handed to the carrier and is on its way to you.',
    trackingLabel: 'Tracking number:',
    carrierLabel: 'Carrier:',
    ctaTracking: 'Track my shipment',
    ctaOrder: 'View order details',
    footer: 'Ophyra — Your wellness, measured.',
  },
};

interface OrderShippedEmailProps {
  locale: 'es' | 'en';
  orderId: string;
  shippingName: string;
  trackingNumber: string;
  trackingUrl?: string | null;
  trackingCarrier?: string | null;
  orderUrl: string;
}

export function getOrderShippedSubject(locale: 'es' | 'en', shortId: string) {
  return copy[locale].subject.replace('{shortId}', shortId);
}

export default function OrderShippedEmail({
  locale,
  orderId,
  shippingName,
  trackingNumber,
  trackingUrl,
  trackingCarrier,
  orderUrl,
}: OrderShippedEmailProps) {
  const t = copy[locale];
  const shortId = orderId.slice(0, 8).toUpperCase();
  const name = shippingName.split(' ')[0] || shippingName;

  return (
    <Html>
      <Head />
      <Body
        style={{
          fontFamily: "'DM Sans', Arial, sans-serif",
          backgroundColor: '#f0faf8',
          margin: 0,
          padding: '32px 16px',
        }}
      >
        <Container
          style={{
            maxWidth: '560px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid rgba(13,148,136,0.14)',
          }}
        >
          <Text
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#0f1f1c',
              margin: '0 0 4px',
            }}
          >
            {t.greeting.replace('{name}', name)}
          </Text>

          <Text
            style={{ fontSize: '15px', color: '#4b6b64', margin: '0 0 24px' }}
          >
            {t.body}
          </Text>

          <Section
            style={{
              backgroundColor: '#eef2ff',
              borderRadius: '12px',
              padding: '20px',
              margin: '0 0 24px',
              borderLeft: '4px solid #6366f1',
            }}
          >
            <Text
              style={{
                fontSize: '12px',
                color: '#4b6b64',
                fontWeight: 600,
                margin: '0 0 4px',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
              }}
            >
              {t.trackingLabel}
            </Text>
            <Text
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#0f1f1c',
                margin: '0 0 12px',
                fontFamily: 'monospace',
              }}
            >
              {trackingNumber}
            </Text>
            {trackingCarrier && (
              <Text
                style={{ fontSize: '13px', color: '#4b6b64', margin: 0 }}
              >
                {t.carrierLabel} <strong>{trackingCarrier}</strong>
              </Text>
            )}
          </Section>

          {trackingUrl && (
            <Button
              href={trackingUrl}
              style={{
                display: 'block',
                backgroundColor: '#6366f1',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 600,
                textAlign: 'center' as const,
                padding: '12px 24px',
                borderRadius: '10px',
                textDecoration: 'none',
                marginBottom: '12px',
              }}
            >
              {t.ctaTracking}
            </Button>
          )}

          <Button
            href={orderUrl}
            style={{
              display: 'block',
              backgroundColor: '#ffffff',
              color: '#0d9488',
              fontSize: '14px',
              fontWeight: 600,
              textAlign: 'center' as const,
              padding: '10px 24px',
              borderRadius: '10px',
              textDecoration: 'none',
              border: '1px solid #0d9488',
            }}
          >
            {t.ctaOrder}
          </Button>

          <Hr
            style={{
              borderColor: 'rgba(13,148,136,0.14)',
              margin: '24px 0 12px',
            }}
          />

          <Text
            style={{
              fontSize: '12px',
              color: '#4b6b64',
              textAlign: 'center' as const,
              margin: 0,
            }}
          >
            {t.footer} · #{shortId}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
