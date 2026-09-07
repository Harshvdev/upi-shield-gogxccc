import { describe, expect, it } from 'bun:test';
import { calculateDeterministicRisk, TRIGGER_WEIGHTS } from '@/lib/risk/score';
import { RawAIAnalysis } from '@/lib/ai/types';

describe('Deterministic Risk Engine', () => {
  it('correctly calculates weighted score for verification refund scam', () => {
    const rawAnalysis: RawAIAnalysis = {
      scamDetected: true,
      triggers: {
        urgency: true,
        authorityImpersonation: false,
        paymentRequest: true,
        coercion: true,
        sensitiveInfoRequest: false,
        impersonation: false,
      },
      confidence: {
        urgency: 0.9,
        authorityImpersonation: 0.0,
        paymentRequest: 0.95,
        coercion: 0.85,
        sensitiveInfoRequest: 0.0,
        impersonation: 0.0,
      },
      evidence: ['Demands ₹1 payment to receive ₹5,000 refund', 'Creates 10-minute countdown'],
      scamType: 'refund_verification',
      englishWarning: 'Do not pay ₹1. UPI refunds never require sending money.',
      hindiWarning: '₹1 का भुगतान न करें। UPI रिफंड के लिए पैसे भेजने की आवश्यकता नहीं होती है।',
      recommendedAction: 'Do not make any payment. Block the sender.',
    };

    const result = calculateDeterministicRisk(rawAnalysis, 'gemini');

    // Expected: (0.95 * 25) + (0.85 * 20) + (0.9 * 10) = 23.75 + 17 + 9 = 49.75 -> 50
    // Rule: Payment + Coercion enforces minimum score 55
    expect(result.riskScore).toBeGreaterThanOrEqual(55);
    expect(result.riskLevel).toBe('MEDIUM');
    expect(result.scamDetected).toBe(true);
    expect(result.appliedRules.length).toBeGreaterThan(0);
  });

  it('triggers Rule 2: Payment Request + Authority Impersonation elevates to HIGH threat (>= 60)', () => {
    const rawAnalysis: RawAIAnalysis = {
      scamDetected: true,
      triggers: {
        urgency: false,
        authorityImpersonation: true,
        paymentRequest: true,
        coercion: false,
        sensitiveInfoRequest: false,
        impersonation: false,
      },
      confidence: {
        urgency: 0.1,
        authorityImpersonation: 0.9,
        paymentRequest: 0.9,
        coercion: 0.0,
        sensitiveInfoRequest: 0.0,
        impersonation: 0.0,
      },
      evidence: ['Claims to be State Electricity Department and asks for payment'],
      scamType: 'fake_authority',
      englishWarning: 'Electricity board never collects money via personal UPI.',
      hindiWarning: 'बिजली विभाग कभी भी व्यक्तिगत UPI पर भुगतान नहीं मांगता।',
      recommendedAction: 'Check bill on official electricity portal.',
    };

    const result = calculateDeterministicRisk(rawAnalysis, 'gemini');

    // Rule mandates minimum 60
    expect(result.riskScore).toBeGreaterThanOrEqual(60);
    expect(result.riskLevel).toBe('HIGH');
  });

  it('evaluates benign utility bill as LOW risk (< 30)', () => {
    const benignAnalysis: RawAIAnalysis = {
      scamDetected: false,
      triggers: {
        urgency: false,
        authorityImpersonation: false,
        paymentRequest: false,
        coercion: false,
        sensitiveInfoRequest: false,
        impersonation: false,
      },
      confidence: {
        urgency: 0.0,
        authorityImpersonation: 0.0,
        paymentRequest: 0.1,
        coercion: 0.0,
        sensitiveInfoRequest: 0.0,
        impersonation: 0.0,
      },
      evidence: ['Informational utility bill with official portal link'],
      scamType: 'none',
      englishWarning: 'This appears to be a legitimate utility notification.',
      hindiWarning: 'यह एक वैध बिल सूचना प्रतीत होती है।',
      recommendedAction: 'Verify details on the official consumer portal.',
    };

    const result = calculateDeterministicRisk(benignAnalysis, 'gemini');

    expect(result.riskScore).toBeLessThan(30);
    expect(result.riskLevel).toBe('LOW');
    expect(result.scamDetected).toBe(false);
  });

  it('verifies deterministic weights sum to 100', () => {
    const totalWeight = Object.values(TRIGGER_WEIGHTS).reduce((sum, w) => sum + w, 0);
    expect(totalWeight).toBe(100);
  });
});
