import { z } from 'zod';
import { isLogisticsRelated } from './domainFilter.js';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

//Todo avec zod, on doit pouvoir faire des trucs cool pour limiter les questions foireux.
//Genre faire un keywords des mots qu'on accepte pour limiter le choix de réponse et éviter une satu, à revenir dessus lors des prochains test en prod

export const answerSchema = z.object({
  question: z
    .string()
    .trim()
    .min(3)
    .max(2000)
    .refine(isLogisticsRelated, {
      message: 'La question doit concerner le domaine logistique.',
    }),
  application: z.string().trim().max(100).optional(),
});

export const feedbackSchema = z.object({
  question: z.string(),
  answer: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});