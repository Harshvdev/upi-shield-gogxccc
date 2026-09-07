import { z } from 'zod';

export const AnalyzeInputSchema = z.object({
  text: z
    .string({ message: 'Message text is required' })
    .trim()
    .min(1, 'Message text is required')
    .max(4000, 'Message cannot exceed 4,000 characters'),
  source: z.enum(
    ['sms', 'whatsapp', 'payment_note', 'upi_intent', 'screenshot'],
    { message: 'Input source must be sms, whatsapp, payment_note, upi_intent, or screenshot' }
  ),
  image: z
    .object({
      base64: z.string().min(10, 'Invalid image data'),
      mimeType: z.string().regex(/^image\/(png|jpeg|webp|gif|jpg)$/, 'Unsupported image format'),
    })
    .optional(),
});

export type ValidatedAnalyzeInput = z.infer<typeof AnalyzeInputSchema>;

