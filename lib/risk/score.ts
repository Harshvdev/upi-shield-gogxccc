import { RawAIAnalysis, RiskLevel, TriggerDetail, AnalysisResponseDTO } from '../ai/types';
import { evaluateSafetyRules } from './rules';

export const TRIGGER_WEIGHTS = {
  paymentRequest: 25,
  coercion: 20,
  authorityImpersonation: 15,
  sensitiveInfoRequest: 15,
  impersonation: 15,
  urgency: 10,
} as const;

export const TRIGGER_META: Record<
  keyof typeof TRIGGER_WEIGHTS,
  { label: string; description: string }
> = {
  paymentRequest: {
    label: 'Payment Demand / Fee',
    description: 'Demands sending money, paying nominal verification fee, or scanning QR code',
  },
  coercion: {
    label: 'Coercion & Threats',
    description: 'Threatens service stoppage, account freezing, or police/legal action',
  },
  authorityImpersonation: {
    label: 'Authority Impersonation',
    description: 'Falsely represents bank managers, RBI, government bodies, or utility providers',
  },
  sensitiveInfoRequest: {
    label: 'Credential / PIN Solicitation',
    description: 'Requests UPI PIN, OTP, CVV, passwords, or remote screen-sharing tools',
  },
  impersonation: {
    label: 'Persona Impersonation',
    description: 'Impersonates customer care, delivery agent, executive, or acquaintance',
  },
  urgency: {
    label: 'Artificial Urgency',
    description: 'Imposes short countdowns or extreme time pressure to rush action',
  },
};

export function calculateDeterministicRisk(
  raw: RawAIAnalysis,
  providerUsed: 'gemini' | 'groq'
): AnalysisResponseDTO {
  const { confidence, triggers } = raw;

  // 1. Weighted confidence summation
  let weightedScore =
    (confidence.paymentRequest || 0) * TRIGGER_WEIGHTS.paymentRequest +
    (confidence.coercion || 0) * TRIGGER_WEIGHTS.coercion +
    (confidence.authorityImpersonation || 0) * TRIGGER_WEIGHTS.authorityImpersonation +
    (confidence.sensitiveInfoRequest || 0) * TRIGGER_WEIGHTS.sensitiveInfoRequest +
    (confidence.impersonation || 0) * TRIGGER_WEIGHTS.impersonation +
    (confidence.urgency || 0) * TRIGGER_WEIGHTS.urgency;

  // 2. Evaluate deterministic safety rules
  const { minScore, appliedRules } = evaluateSafetyRules(raw);

  if (minScore > weightedScore) {
    weightedScore = minScore;
  }

  // 3. Bound score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, Math.round(weightedScore)));

  // 4. Map to threat levels
  let riskLevel: RiskLevel = 'LOW';
  if (finalScore >= 60) {
    riskLevel = 'HIGH';
  } else if (finalScore >= 30) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }

  // 5. Structure trigger details for UI visualization
  const triggerKeys: (keyof typeof TRIGGER_WEIGHTS)[] = [
    'paymentRequest',
    'coercion',
    'authorityImpersonation',
    'sensitiveInfoRequest',
    'impersonation',
    'urgency',
  ];

  const triggerDetails: TriggerDetail[] = triggerKeys.map((key) => ({
    key,
    label: TRIGGER_META[key].label,
    description: TRIGGER_META[key].description,
    detected: Boolean(triggers[key]),
    confidence: Number((confidence[key] || 0).toFixed(2)),
    weight: TRIGGER_WEIGHTS[key],
  }));

  return {
    riskLevel,
    riskScore: finalScore,
    scamDetected: raw.scamDetected || finalScore >= 60,
    triggers: raw.triggers,
    confidence: raw.confidence,
    triggerDetails,
    evidence: raw.evidence || [],
    scamType: raw.scamType,
    englishWarning: raw.englishWarning,
    hindiWarning: raw.hindiWarning,
    recommendedAction: raw.recommendedAction,
    providerUsed,
    appliedRules: appliedRules.map((r) => r.description),
    timestamp: new Date().toISOString(),
  };
}
