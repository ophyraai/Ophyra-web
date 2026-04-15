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
    subject: 'Pedido confirmado — #{shortId}',
    greeting: '¡Hola {name}!',
    thanks: 'Hemos recibido tu pedido. Aquí tienes el resumen:',
    orderNumber: 'Pedido:',
    items: 'Artículos:',
    subtotal: 'Subtotal:',
    shipping: 'Envío:',
    total: 'Total:',
    shippingTo: 'Envío a:',
    shippingNotice:
      'El envío puede tardar varios días dependiendo de tu ubicación. Te enviaremos un email con el número de seguimiento en cuanto salga del almacén.',
    cta: 'Ver mi pedido',
    footer: 'Ophyra — Tu bienestar, medido.',
  },
  en: {
    subject: 'Order confirmed — #{shortId}',
    greeting: 'Hi {name}!',
    thanks: "We've received your order. Here's a summary:",
    orderNumber: 'Order:',
    items: 'Items:',
    subtotal: 'Subtotal:',
    shipping: 'Shipping:',
    total: 'Total:',
    shippingTo: 'Shipping to:',
    shippingNotice:
      'Shipping may take several days depending on your location. We will send you a tracking email once the package leaves the warehouse.',
    cta: 'View my order',
    footer: 'Ophyra — Your wellness, measured.',
  },
};

interface OrderItem {
  name: string;
  quantity: number;
  unit_price_cents: number;
}

interface OrderConfirmationEmailProps {
  locale: 'es' | 'en';
  orderId: string;
  items: OrderItem[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  currency: string;
  shippingName: string;
  shippingCity: string;
  shippingCountry: string;
  orderUrl: string;
}

function fmt(cents: number, currency: string) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function getOrderConfirmationSubject(
  locale: 'es' | 'en',
  shortId: string,
) {
  return copy[locale].subject.replace('{shortId}', shortId);
}

export default function OrderConfirmationEmail({
  locale,
  orderId,
  items,
  subtotalCents,
  shippingCents,
  totalCents,
  currency,
  shippingName,
  shippingCity,
  shippingCountry,
  orderUrl,
}: OrderConfirmationEmailProps) {
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
            {t.thanks}
          </Text>

          {/* Resumen del pedido */}
          <Section
            style={{
              backgroundColor: '#f0faf8',
              borderRadius: '12px',
              padding: '20px',
              margin: '0 0 24px',
            }}
          >
            <Text
              style={{
                fontSize: '13px',
                color: '#4b6b64',
                margin: '0 0 4px',
                fontWeight: 600,
              }}
            >
              {t.orderNumber} #{shortId}
            </Text>

            <Hr
              style={{ borderColor: 'rgba(13,148,136,0.14)', margin: '8px 0' }}
            />

            {items.map((item, i) => (
              <Text
                key={i}
                style={{ fontSize: '14px', color: '#0f1f1c', margin: '4px 0' }}
              >
                {item.quantity}x {item.name} — {fmt(item.unit_price_cents * item.quantity, currency)}
              </Text>
            ))}

            <Hr
              style={{ borderColor: 'rgba(13,148,136,0.14)', margin: '8px 0' }}
            />

            <Text
              style={{ fontSize: '14px', color: '#4b6b64', margin: '4px 0' }}
            >
              {t.subtotal} {fmt(subtotalCents, currency)}
            </Text>
            <Text
              style={{ fontSize: '14px', color: '#4b6b64', margin: '4px 0' }}
            >
              {t.shipping} {fmt(shippingCents, currency)}
            </Text>
            <Text
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#0f1f1c',
                margin: '8px 0 0',
              }}
            >
              {t.total} {fmt(totalCents, currency)}
            </Text>
          </Section>

          {/* Dirección */}
          <Text
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#4b6b64',
              margin: '0 0 4px',
            }}
          >
            {t.shippingTo}
          </Text>
          <Text style={{ fontSize: '14px', color: '#0f1f1c', margin: '0 0 20px' }}>
            {shippingName}, {shippingCity}, {shippingCountry}
          </Text>

          {/* Aviso de tiempos de envío */}
          <Section
            style={{
              backgroundColor: '#eff6ff',
              borderRadius: '12px',
              padding: '16px',
              margin: '0 0 24px',
              borderLeft: '4px solid #3b82f6',
            }}
          >
            <Text style={{ fontSize: '13px', color: '#1e3a5f', margin: 0 }}>
              📦 {t.shippingNotice}
            </Text>
          </Section>

          <Button
            href={orderUrl}
            style={{
              display: 'block',
              backgroundColor: '#0d9488',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 600,
              textAlign: 'center' as const,
              padding: '12px 24px',
              borderRadius: '10px',
              textDecoration: 'none',
            }}
          >
            {t.cta}
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
            {t.footer}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
