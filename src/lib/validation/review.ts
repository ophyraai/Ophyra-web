import { z } from 'zod';

export const reviewCreateSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(10).max(2000),
  author_name: z.string().trim().min(2).max(50).optional(),
});

export const reviewGenerateSchema = z.object({
  product_id: z.string().uuid(),
  count: z.number().int().min(1).max(50).default(20),
  locale: z.enum(['es', 'en']).default('es'),
});
