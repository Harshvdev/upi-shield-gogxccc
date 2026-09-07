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

  // Rule 1: Payment Request + Coercion (threat) -> mandates HIGH threat (65)
  if (triggers.paymentRequest && triggers.coercion) {
    applied.push({
      id: 'RULE_PAYMENT_COERCION',
      description: 'Payment request combined with coercive threats (disconnection, account freeze) elevates to HIGH threat (65)',
      minScore: 65,
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

  // Rule 5: Verification Refund Scam / Nominal Fee Reversal Trap -> mandates HIGH threat (70)
  // In UPI mechanics, receiving money NEVER requires sending money, scanning a QR, or paying a verification token.
  if (
    analysis.scamType === 'refund_verification' ||
    (triggers.paymentRequest && triggers.urgency && analysis.evidence.some(e => /refund|reversal|verify|verification|token|₹1|₹10/i.test(e)))
  ) {
    applied.push({
      id: 'RULE_REFUND_VERIFICATION_TRAP',
      description: 'Verification refund trap: In UPI, receiving refunds never requires sending money or paying token fees (mandates HIGH threat: 70)',
      minScore: 70,
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
