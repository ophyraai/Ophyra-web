import { Truck, Clock } from 'lucide-react';

interface Props {
  variant?: 'card' | 'banner' | 'compact';
  className?: string;
}

/**
 * Aviso de tiempos de envío para productos Marca Ophyra (dropshipping).
 *
 * IMPORTANTE: este componente debe aparecer en MÚLTIPLES sitios para
 * cumplir con las exigencias de Stripe sobre disclosure pre-purchase
 * y minimizar disputes:
 *   1. Card del producto (compact)
 *   2. Página detalle del producto (banner)
 *   3. Carrito (banner)
 *   4. Stripe Checkout custom_text.submit.message (en /api/checkout/cart)
 *   5. Email de confirmación post-pago
 */
export default function ShippingDisclaimer({
  variant = 'card',
  className,
}: Props) {
  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center gap-1 text-[11px] text-ofira-text-secondary ${className || ''}`}
      >
        <Clock className="size-3" />
        Envío 15-45 días
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800 ${className || ''}`}
      >
        <Truck className="mt-0.5 size-3.5 shrink-0" />
        <span>
          <strong>Envío internacional 15-45 días</strong> desde nuestro proveedor.
        </span>
      </div>
    );
  }

  // banner
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 ${className || ''}`}
    >
      <Truck className="mt-0.5 size-5 shrink-0" />
      <div>
        <div className="font-semibold">Envío internacional 15-45 días</div>
        <div className="mt-0.5 text-xs text-blue-800">
          Este producto se envía desde nuestro proveedor internacional. Recibirás un
          email con el número de seguimiento en cuanto salga del almacén.
        </div>
      </div>
    </div>
  );
}
