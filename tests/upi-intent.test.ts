import { describe, expect, it } from 'bun:test';
import { parseUPIIntent, buildUPITextSummary } from '@/lib/upi/intent';

describe('Raw UPI Intent Parser & Heuristics', () => {
  it('correctly parses valid upi://pay URI parameters', () => {
    const uri = 'upi://pay?pa=merchant@icici&pn=Bescom+Electricity&am=850.00&cu=INR&tn=Electricity+Bill';
    const parsed = parseUPIIntent(uri);

    expect(parsed.isUPIUri).toBe(true);
    expect(parsed.payeeAddress).toBe('merchant@icici');
    expect(parsed.payeeName).toBe('Bescom Electricity');
    expect(parsed.amount).toBe('850.00');
    expect(parsed.currency).toBe('INR');
    expect(parsed.transactionNote).toBe('Electricity Bill');
  });

  it('detects spoofed consumer VPA handle with official keywords', () => {
    const scamUri = 'upi://pay?pa=refund.verification@paytm&pn=Amazon+Desk&am=1.00&cu=INR&tn=Verification+fee';
    const parsed = parseUPIIntent(scamUri);

    expect(parsed.isUPIUri).toBe(true);
    const hasSpoofedFlag = parsed.heuristicFlags.some((f) => f.id === 'SPOOFED_CONSUMER_VPA');
    const hasNominalTrap = parsed.heuristicFlags.some((f) => f.id === 'NOMINAL_FEE_TRAP');

    expect(hasSpoofedFlag).toBe(true);
    expect(hasNominalTrap).toBe(true);
    expect(parsed.riskIndicators.length).toBeGreaterThan(0);
  });

  it('detects institutional authority name mismatch on personal PSP handle', () => {
    const mismatchUri = 'upi://pay?pa=fraudster9872@okaxis&pn=SBI+Bank+Verification&am=10.00&cu=INR&tn=KYC+Update';
    const parsed = parseUPIIntent(mismatchUri);

    expect(parsed.isUPIUri).toBe(true);
    const hasAuthorityMismatch = parsed.heuristicFlags.some((f) => f.id === 'AUTHORITY_MISMATCH');
    expect(hasAuthorityMismatch).toBe(true);
  });

  it('returns isUPIUri: false for regular SMS message text', () => {
    const text = 'Your electricity bill of ₹850 is due on 15 September. Pay via official portal.';
    const parsed = parseUPIIntent(text);

    expect(parsed.isUPIUri).toBe(false);
    expect(parsed.heuristicFlags.length).toBe(0);
  });

  it('generates an enriched summary text suitable for AI analysis', () => {
    const scamUri = 'upi://pay?pa=refund.dept@paytm&pn=Refund&am=1.00&cu=INR&tn=Verify+Token';
    const parsed = parseUPIIntent(scamUri);
    const summary = buildUPITextSummary(parsed);

    expect(summary).toContain('Payee VPA: refund.dept@paytm');
    expect(summary).toContain('Amount: ₹1.00 INR');
    expect(summary).toContain('Deterministic Heuristic Alerts');
  });
});
