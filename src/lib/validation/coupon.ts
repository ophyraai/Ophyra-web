import { z } from 'zod';

// Códigos: solo letras (sin ñ/acento), números, guiones y guiones bajos.
// Normalizamos a UPPERCASE para unicidad case-insensitive.
const codeRegex = /^[A-Z0-9_-]{2,32}$/;

export const couponCodeSchema = z
  .string()
  .trim()
  .transform((s) => s.toUpperCase())
  .pipe(
    z
      .string()
      .regex(codeRegex, 'Solo letras, números, "-" y "_" (2-32 caracteres)'),
  );

// ============================================
// Crear cupón (admin)
// ============================================

const basePercentCreate = z.object({
  code: couponCodeSchema,
  type: z.literal('percent'),
  percent_off: z.number().int().min(1).max(100),
  max_redemptions: z.number().int().positive().optional().nullable(),
  min_subtotal_cents: z.number().int().positive().optional().nullable(),
  expires_at: z.string().datetime().optional().nullable(),
});

const baseAmountCreate = z.object({
  code: couponCodeSchema,
  type: z.literal('amount'),
  amount_off_cents: z.number().int().positive(),
  max_redemptions: z.number().int().positive().optional().nullable(),
  min_subtotal_cents: z.number().int().positive().optional().nullable(),
  expires_at: z.string().datetime().optional().nullable(),
});

export const couponCreateSchema = z.discriminatedUnion('type', [
  basePercentCreate,
  baseAmountCreate,
]);

export type CouponCreateInput = z.infer<typeof couponCreateSchema>;

// ============================================
// Actualizar cupón (admin) — solo flags mutables
// ============================================

export const couponUpdateSchema = z.object({
  active: z.boolean().optional(),
  max_redemptions: z.number().int().positive().nullable().optional(),
  min_subtotal_cents: z.number().int().positive().nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
});

export type CouponUpdateInput = z.infer<typeof couponUpdateSchema>;

// ============================================
// Validar cupón (público, desde el carrito)
// ============================================

export const couponValidateSchema = z.object({
  code: couponCodeSchema,
  subtotal_cents: z.number().int().nonnegative(),
});

export type CouponValidateInput = z.infer<typeof couponValidateSchema>;
