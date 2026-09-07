import { z } from 'zod';

export const ScamAnalysisSchema = z.object({
  scamDetected: z.boolean(),

  triggers: z.object({
    urgency: z.boolean(),
    authorityImpersonation: z.boolean(),
    paymentRequest: z.boolean(),
    coercion: z.boolean(),
    sensitiveInfoRequest: z.boolean(),
    impersonation: z.boolean(),
  }),

  confidence: z.object({
    urgency: z.number().min(0).max(1),
    authorityImpersonation: z.number().min(0).max(1),
    paymentRequest: z.number().min(0).max(1),
    coercion: z.number().min(0).max(1),
    sensitiveInfoRequest: z.number().min(0).max(1),
    impersonation: z.number().min(0).max(1),
  }),

  evidence: z.array(z.string()).max(6),

  scamType: z.enum([
    'payment_request',
    'refund_verification',
    'fake_authority',
    'account_threat',
    'credential_theft',
    'impersonation',
    'other',
    'none',
  ]).catch('other'),

  englishWarning: z.string(),
  hindiWarning: z.string(),

  recommendedAction: z.string(),
});

export type ValidatedRawAnalysis = z.infer<typeof ScamAnalysisSchema>;
