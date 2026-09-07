import { RawAIAnalysis } from '../ai/types';

export interface AppliedRule {
  id: string;
  description: string;
  minScore: number;
}

export function evaluateSafetyRules(analysis: RawAIAnalysis): {
  minScore: number;
  appliedRules: AppliedRule[];
} {
  const applied: AppliedRule[] = [];
  const { triggers } = analysis;

  // Rule 1: Payment Request + Coercion (threat) -> min score 55
  if (triggers.paymentRequest && triggers.coercion) {
    applied.push({
      id: 'RULE_PAYMENT_COERCION',
      description: 'Payment request combined with coercive threats mandates minimum MEDIUM threat (55)',
      minScore: 55,
    });
  }

  // Rule 2: Payment Request + Authority Impersonation -> min score 60
  if (triggers.paymentRequest && triggers.authorityImpersonation) {
    applied.push({
      id: 'RULE_PAYMENT_AUTHORITY',
      description: 'Payment request under institutional/authority guise elevates to HIGH threat (60)',
      minScore: 60,
    });
  }

  // Rule 3: Sensitive Information Request + Impersonation -> min score 60
  if (triggers.sensitiveInfoRequest && triggers.impersonation) {
    applied.push({
      id: 'RULE_SENSITIVE_IMPERSONATION',
      description: 'Credential/PIN solicitation via persona impersonation elevates to HIGH threat (60)',
      minScore: 60,
    });
  }

  // Rule 4: Sensitive Information Request alone is inherently critical for UPI
  if (triggers.sensitiveInfoRequest && analysis.confidence.sensitiveInfoRequest >= 0.7) {
    applied.push({
      id: 'RULE_SENSITIVE_INFO_CRITICAL',
      description: 'Direct UPI PIN/OTP solicitation requires high-severity guardrails (60)',
      minScore: 60,
    });
  }

  const highestMinScore = applied.reduce((max, r) => Math.max(max, r.minScore), 0);

  return {
    minScore: highestMinScore,
    appliedRules: applied,
  };
}
