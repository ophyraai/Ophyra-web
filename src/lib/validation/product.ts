import { z } from 'zod';

// Categoría: string libre (con sugerencias en el form admin via datalist).
// Validamos longitud y caracteres razonables, pero NO restringimos a un enum
// para que ander pueda añadir lo que quiera (electrónica, ropa, decoración, etc.).
export const productCategorySchema = z
  .string()
  .min(2)
  .max(50)
  .regex(/^[a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ&-]+$/, 'Caracteres no válidos en la categoría');

export const productTypeSchema = z.enum(['affiliate', 'own']);

// Slug: solo lowercase, números, guiones. No empieza ni acaba en guión.
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const baseProductFields = {
  name: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(slugRegex, 'slug debe ser lowercase con guiones (ej: cinta-correr-pro)'),
  category: productCategorySchema,
  short_description: z.string().max(280).optional().nullable(),
  long_description: z.string().max(8000).optional().nullable(),
  image_url: z.string().url().max(2048).optional().nullable(),
  images: z.array(z.string().url().max(2048)).max(8).default([]),
  is_active: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  sort_order: z.number().int().min(0).default(0),
  badge: z.string().max(30).optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  review_count: z.number().int().min(0).default(0),
};

// ============================================
// Crear producto: ramas por type
// ============================================

const affiliateCreateSchema = z.object({
  ...baseProductFields,
  type: z.literal('affiliate'),
  affiliate_url: z.string().url().max(2048),
  // Para afiliados el price es solo display; aceptamos cents o decimal
  price_cents: z.number().int().positive().optional().nullable(),
});

const ownCreateSchema = z
  .object({
    ...baseProductFields,
    type: z.literal('own'),
    price_cents: z.number().int().positive(),
    compare_at_price_cents: z.number().int().positive().optional().nullable(),
    currency: z.string().length(3).toLowerCase().default('eur'),
    weight_grams: z.number().int().positive().optional().nullable(),
    supplier_url: z.string().url().max(2048).optional().nullable(),
    supplier_sku: z.string().max(100).optional().nullable(),
    supplier_notes: z.string().max(2000).optional().nullable(),
    internal_ref: z.string().max(100).optional().nullable(),
  })
  .refine(
    (d) =>
      d.compare_at_price_cents == null ||
      d.compare_at_price_cents > d.price_cents,
    {
      message: 'compare_at_price_cents debe ser mayor que price_cents',
      path: ['compare_at_price_cents'],
    },
  );

export const productCreateSchema = z.discriminatedUnion('type', [
  affiliateCreateSchema,
  ownCreateSchema,
]);

export type ProductCreateInput = z.infer<typeof productCreateSchema>;

// ============================================
// Update: todos los campos opcionales, type NO se puede cambiar
// ============================================

export const productUpdateSchema = z.object({
  name: baseProductFields.name.optional(),
  slug: baseProductFields.slug.optional(),
  category: baseProductFields.category.optional(),
  short_description: baseProductFields.short_description,
  long_description: baseProductFields.long_description,
  image_url: baseProductFields.image_url,
  images: baseProductFields.images.optional(),
  is_active: baseProductFields.is_active.optional(),
  is_featured: baseProductFields.is_featured.optional(),
  sort_order: baseProductFields.sort_order.optional(),
  badge: baseProductFields.badge,
  rating: baseProductFields.rating,
  review_count: baseProductFields.review_count.optional(),
  affiliate_url: z.string().url().max(2048).optional().nullable(),
  price_cents: z.number().int().positive().optional().nullable(),
  compare_at_price_cents: z.number().int().positive().optional().nullable(),
  currency: z.string().length(3).toLowerCase().optional(),
  weight_grams: z.number().int().positive().optional().nullable(),
  supplier_url: z.string().url().max(2048).optional().nullable(),
  supplier_sku: z.string().max(100).optional().nullable(),
  supplier_notes: z.string().max(2000).optional().nullable(),
  internal_ref: z.string().max(100).optional().nullable(),
});

export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

// ============================================
// Cart checkout
// ============================================

export const cartItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
  // El cliente envía su precio "esperado" para que el server lo verifique
  // contra la BD y devuelva 409 si cambió.
  expected_unit_price_cents: z.number().int().positive(),
});

export const shippingAddressSchema = z.object({
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional().nullable(),
  city: z.string().min(1).max(100),
  region: z.string().max(100).optional().nullable(),
  postal_code: z.string().min(1).max(20),
  country: z.string().length(2).toUpperCase(), // ISO 3166-1 alpha-2
});

export const cartCheckoutSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(20),
  locale: z.enum(['es', 'en']).default('es'),
  // ISO-3166-1 alpha-2 — se usa para calcular la zona de envío.
  shipping_country: z.string().length(2).toUpperCase(),
  // Email para guest checkout (si no hay sesión)
  email: z.string().email().max(254).optional(),
  // Código de cupón opcional — validado server-side antes de pasar a Stripe
  coupon_code: z
    .string()
    .trim()
    .transform((s) => s.toUpperCase())
    .pipe(z.string().min(2).max(32))
    .optional(),
});

export type CartCheckoutInput = z.infer<typeof cartCheckoutSchema>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
