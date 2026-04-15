import { z } from 'zod';

export const orderStatusSchema = z.enum([
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]);

// PATCH admin: todos los campos son opcionales, pero al menos uno debe venir.
// El tracking_url, si viene, debe ser URL válida.
export const orderUpdateSchema = z
  .object({
    status: orderStatusSchema.optional(),
    tracking_number: z.string().trim().min(1).max(100).nullable().optional(),
    tracking_url: z.string().trim().url().max(500).nullable().optional(),
    tracking_carrier: z.string().trim().min(1).max(50).nullable().optional(),
    admin_notes: z.string().trim().max(500).nullable().optional(),
  })
  .refine(
    (data) => Object.values(data).some((v) => v !== undefined),
    { message: 'Al menos un campo debe ser actualizado' },
  );

// POST refund: amount opcional (total si no se indica). Reason para auditoría.
export const orderRefundSchema = z.object({
  amount_cents: z.number().int().positive().optional(),
  reason: z
    .enum(['requested_by_customer', 'duplicate', 'fraudulent', 'other'])
    .default('requested_by_customer'),
  note: z.string().trim().max(500).optional(),
});

// Filtros lista admin (query params)
export const orderListQuerySchema = z.object({
  status: orderStatusSchema.optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(25),
});

export type OrderUpdateInput = z.infer<typeof orderUpdateSchema>;
export type OrderRefundInput = z.infer<typeof orderRefundSchema>;
export type OrderListQuery = z.infer<typeof orderListQuerySchema>;
