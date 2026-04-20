import { z } from 'zod';

export const diagnosisSubmitSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().max(100).optional().nullable(),
  locale: z.enum(['es', 'en']).default('es'),
  answers: z.record(z.string(), z.unknown()),
  photoUrls: z.array(z.string().url()).max(3).optional().nullable(),
});

export const diagnosisAnalyzeSchema = z.object({
  diagnosisId: z.string().uuid(),
  answers: z.record(z.string(), z.unknown()),
  scores: z.record(z.string(), z.number()),
  locale: z.enum(['es', 'en']).optional(),
  photoUrls: z.array(z.string().url()).max(3).optional().nullable(),
});

export const diagnosisUpdateEmailSchema = z.object({
  diagnosisId: z.string().uuid(),
  email: z.string().email().max(254),
});
