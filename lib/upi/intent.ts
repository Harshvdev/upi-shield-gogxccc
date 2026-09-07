export interface ParsedUPIIntent {
  rawUri: string;
  isUPIUri: boolean;
  payeeAddress?: string; // pa
  payeeName?: string; // pn
  amount?: string; // am
  currency?: string; // cu
  transactionNote?: string; // tn
  merchantCode?: string; // mc
  transactionRef?: string; // tr
  heuristicFlags: UPIHeuristicFlag[];
  riskIndicators: string[];
}

export interface UPIHeuristicFlag {
  id: string;
  severity: 'HIGH' | 'MEDIUM' | 'INFO';
  title: string;
  description: string;
}

const SUSPICIOUS_VPA_KEYWORDS = [
  'refund',
  'cashback',
  'kyc',
  'verification',
  'verify',
  'electricity',
  'bijli',
  'bill',
  'customercare',
  'customer-care',
  'support',
  'helpline',
  'officer',
  'reward',
  'lottery',
  'gift',
  'claim',
  'complaint',
  'npci',
  'rbi',
  'sbi-kyc',
  'hdfc-kyc',
  'token',
];

const COMMON_CONSUMER_PSP_HANDLES = [
  '@paytm',
  '@okaxis',
  '@oksbi',
  '@okhdfcbank',
  '@okicici',
  '@ybl',
  '@ibl',
  '@axl',
  '@apl',
  '@pingpay',
];

/**
 * Parses raw UPI link (upi://pay?pa=... or https://...upi://pay...)
 */
export function parseUPIIntent(input: string): ParsedUPIIntent {
  const trimmed = input.trim();
  const upiMatch = trimmed.match(/upi:\/\/pay\?[^\s"'>]+/i);
  const uriToParse = upiMatch ? upiMatch[0] : trimmed;

  const result: ParsedUPIIntent = {
    rawUri: uriToParse,
    isUPIUri: false,
    heuristicFlags: [],
    riskIndicators: [],
  };

  if (!uriToParse.toLowerCase().startsWith('upi://pay')) {
    return result;
  }

  result.isUPIUri = true;

  try {
    // Normalise to standard URL query parser
    const queryString = uriToParse.replace(/^upi:\/\/pay\?/i, '');
    const params = new URLSearchParams(queryString);

    result.payeeAddress = params.get('pa') || undefined;
    result.payeeName = params.get('pn') || undefined;
    result.amount = params.get('am') || undefined;
    result.currency = params.get('cu') || 'INR';
    result.transactionNote = params.get('tn') || undefined;
    result.merchantCode = params.get('mc') || undefined;
    result.transactionRef = params.get('tr') || undefined;

    // Run Heuristic Safety Checks
    evaluateUPIHeuristics(result);
  } catch {
    result.heuristicFlags.push({
      id: 'MALFORMED_UPI_URI',
      severity: 'MEDIUM',
      title: 'Malformed UPI Intent',
      description: 'The UPI link structure is malformed or improperly encoded.',
    });
  }

  return result;
}

function evaluateUPIHeuristics(intent: ParsedUPIIntent): void {
  const flags: UPIHeuristicFlag[] = [];
  const indicators: string[] = [];

  const pa = (intent.payeeAddress || '').toLowerCase();
  const pn = (intent.payeeName || '').toLowerCase();
  const tn = (intent.transactionNote || '').toLowerCase();
  const amountNum = intent.amount ? parseFloat(intent.amount) : null;

  // 1. Mandatory UPI warning: UPI Pay links NEVER credit money
  flags.push({
    id: 'UPI_ALWAYS_DEBIT',
    severity: 'INFO',
    title: 'UPI Debit Rule',
    description: 'upi://pay links are exclusively for DEBITING money from your account. You can NEVER receive money or refunds by clicking this link.',
  });

  // 2. Suspicious keywords in consumer VPA handle
  const foundKeywords = SUSPICIOUS_VPA_KEYWORDS.filter((kw) => pa.includes(kw));
  const isConsumerHandle = COMMON_CONSUMER_PSP_HANDLES.some((h) => pa.endsWith(h));

  if (foundKeywords.length > 0 && isConsumerHandle) {
    flags.push({
      id: 'SPOOFED_CONSUMER_VPA',
      severity: 'HIGH',
      title: 'Spoofed Consumer VPA Handle',
      description: `The recipient address (${intent.payeeAddress}) is a personal consumer account containing official keywords (${foundKeywords.join(', ')}). Legitimate authorities never use personal consumer VPAs.`,
    });
    indicators.push(`Personal consumer VPA mimicking official authority: ${intent.payeeAddress}`);
  }

  // 3. Nominal fee reversal/refund trap (₹1 to ₹10)
  const isSmallAmount = amountNum !== null && amountNum > 0 && amountNum <= 10;
  const isRefundOrVerifyContext =
    tn.includes('refund') ||
    tn.includes('verify') ||
    tn.includes('verification') ||
    tn.includes('kyc') ||
    tn.includes('token') ||
    pn.includes('refund') ||
    pn.includes('verify');

  if (isSmallAmount && isRefundOrVerifyContext) {
    flags.push({
      id: 'NOMINAL_FEE_TRAP',
      severity: 'HIGH',
      title: 'Nominal Verification Fee Trap',
      description: `Requests a small amount (₹${intent.amount}) under the guise of verification or refund release. This is a primary UPI fraud vector.`,
    });
    indicators.push(`Small token payment of ₹${intent.amount} requested to 'verify' or 'release' funds.`);
  }

  // 4. Authority Name Mismatch
  const authorityKeywords = ['bank', 'sbi', 'bescom', 'police', 'rbi', 'income tax', 'court', 'electricity'];
  const claimsAuthority = authorityKeywords.some((ak) => pn.includes(ak) || tn.includes(ak));
  if (claimsAuthority && isConsumerHandle) {
    flags.push({
      id: 'AUTHORITY_MISMATCH',
      severity: 'HIGH',
      title: 'Institutional Name Mismatch',
      description: `Payee claims to be "${intent.payeeName}" but points to a generic third-party handle (${intent.payeeAddress}) rather than a verified merchant ID.`,
    });
    indicators.push(`Claims institutional name (${intent.payeeName}) on personal PSP handle (${intent.payeeAddress}).`);
  }

  // 5. Blank / Zero Amount Trap
  if (amountNum === null || amountNum === 0) {
    flags.push({
      id: 'UNSPECIFIED_AMOUNT',
      severity: 'MEDIUM',
      title: 'Unspecified Amount',
      description: 'This UPI link leaves the amount open or zero, allowing the scammer to attempt debits or request manual input.',
    });
  }

  intent.heuristicFlags = flags;
  intent.riskIndicators = indicators;
}

/**
 * Transforms parsed UPI intent into a descriptive text summary suitable for AI analysis.
 */
export function buildUPITextSummary(intent: ParsedUPIIntent): string {
  const parts: string[] = [];
  parts.push(`Raw UPI Intent URI: ${intent.rawUri}`);
  if (intent.payeeAddress) parts.push(`Payee VPA: ${intent.payeeAddress}`);
  if (intent.payeeName) parts.push(`Payee Name: ${intent.payeeName}`);
  if (intent.amount) parts.push(`Amount: ₹${intent.amount} ${intent.currency || 'INR'}`);
  if (intent.transactionNote) parts.push(`Transaction Note: ${intent.transactionNote}`);
  if (intent.merchantCode) parts.push(`Merchant Code: ${intent.merchantCode}`);

  if (intent.riskIndicators.length > 0) {
    parts.push(`Deterministic Heuristic Alerts: ${intent.riskIndicators.join('; ')}`);
  }

  return parts.join('\n');
}
