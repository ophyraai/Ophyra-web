import { stripe } from '@/lib/stripe';

/**
 * Helpers para gestionar productos y precios en Stripe.
 *
 * IMPORTANTE — inmutabilidad de prices:
 * Los precios en Stripe son inmutables. Si quieres "cambiar el precio"
 * de un producto, hay que crear un Price nuevo y archivar el viejo.
 * Los Order/PaymentIntent existentes seguirán referenciando el price antiguo,
 * por eso archivamos en lugar de borrar.
 *
 * El source-of-truth de los precios históricos está en
 * `order_items.unit_price_cents`, no en Stripe.
 */

interface CreateResult {
  stripe_product_id: string;
  stripe_price_id: string;
}

/**
 * Crea un Product + Price en Stripe en una sola operación.
 * Tax behavior: 'exclusive' (el precio mostrado NO incluye IVA — Stripe Tax
 * lo añade en checkout si automatic_tax está habilitado).
 */
export async function createStripeProductAndPrice(params: {
  name: string;
  description?: string | null;
  priceCents: number;
  currency?: string;
  images?: string[];
  metadata?: Record<string, string>;
}): Promise<CreateResult> {
  const { name, description, priceCents, currency = 'eur', images, metadata } = params;

  const product = await stripe.products.create({
    name,
    description: description || undefined,
    images: images && images.length > 0 ? images.slice(0, 8) : undefined,
    metadata: metadata || {},
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: priceCents,
    currency,
    tax_behavior: 'exclusive',
  });

  return {
    stripe_product_id: product.id,
    stripe_price_id: price.id,
  };
}

/**
 * Archiva un Price en Stripe (lo desactiva sin borrarlo, para no romper
 * referencias en orders históricos).
 */
export async function archiveStripePrice(priceId: string): Promise<void> {
  try {
    await stripe.prices.update(priceId, { active: false });
  } catch (err) {
    // Si el price ya no existe o ya está inactivo, no es bloqueante
    console.error(`archiveStripePrice failed for ${priceId}:`, err);
  }
}

/**
 * Cambia el precio de un producto: archiva el price antiguo y crea uno nuevo
 * vinculado al mismo Stripe Product. Devuelve el nuevo price_id.
 *
 * El caller debe actualizar `products.stripe_price_id` en BD con el resultado.
 */
export async function syncProductPrice(params: {
  stripeProductId: string;
  oldStripePriceId: string | null;
  newPriceCents: number;
  currency?: string;
}): Promise<string> {
  const { stripeProductId, oldStripePriceId, newPriceCents, currency = 'eur' } = params;

  if (oldStripePriceId) {
    await archiveStripePrice(oldStripePriceId);
  }

  const newPrice = await stripe.prices.create({
    product: stripeProductId,
    unit_amount: newPriceCents,
    currency,
    tax_behavior: 'exclusive',
  });

  return newPrice.id;
}

/**
 * Sincroniza nombre / descripción / imágenes del producto Stripe.
 * Esto SÍ es mutable (a diferencia de los prices).
 */
export async function updateStripeProduct(params: {
  stripeProductId: string;
  name?: string;
  description?: string | null;
  images?: string[];
  active?: boolean;
}): Promise<void> {
  const { stripeProductId, name, description, images, active } = params;

  await stripe.products.update(stripeProductId, {
    ...(name !== undefined && { name }),
    ...(description !== undefined && { description: description || undefined }),
    ...(images !== undefined && { images: images.slice(0, 8) }),
    ...(active !== undefined && { active }),
  });
}

/**
 * Archiva un producto Stripe completo (para soft-delete).
 */
export async function archiveStripeProduct(stripeProductId: string): Promise<void> {
  try {
    await stripe.products.update(stripeProductId, { active: false });
  } catch (err) {
    console.error(`archiveStripeProduct failed for ${stripeProductId}:`, err);
  }
}
