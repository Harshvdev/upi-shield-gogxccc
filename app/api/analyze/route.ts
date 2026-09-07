import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeInputSchema } from '@/lib/validation/input';
import { executeScamAnalysis } from '@/lib/ai/provider';
import { calculateDeterministicRisk } from '@/lib/risk/score';
import { checkRateLimit } from '@/lib/utils/rate-limit';

export async function POST(req: NextRequest) {
  try {
    // 1. IP Throttling and Rate Limiting
    const forwarded = req.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: rateLimit.reason,
          retryAfter: rateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds || 2),
          },
        }
      );
    }

    // 2. Parse and validate JSON input
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const validationResult = AnalyzeInputSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues
        .map((i) => i.message)
        .join(', ');
      return NextResponse.json(
        { error: 'Validation failed', details: errorMessage },
        { status: 400 }
      );
    }

    const { text, source, image } = validationResult.data;

    // Handle UPI Intent Parsing if applicable
    let analysisText = text;
    let upiDetails = undefined;
    if (source === 'upi_intent' || text.toLowerCase().includes('upi://pay')) {
      const { parseUPIIntent, buildUPITextSummary } = await import('@/lib/upi/intent');
      upiDetails = parseUPIIntent(text);
      if (upiDetails.isUPIUri) {
        analysisText = buildUPITextSummary(upiDetails);
      }
    }

    // 3. AI Provider Execution (Primary: Gemini -> Fallback: Groq Qwen)
    // Note: Privacy rule strictly followed — text is not logged
    const { analysis, providerUsed } = await executeScamAnalysis({
      text: analysisText,
      source,
      image,
    });

    // 4. Deterministic Risk Engine evaluation
    const finalDTO = calculateDeterministicRisk(analysis, providerUsed);

    // Attach bonus feature outputs if present
    if (upiDetails && upiDetails.isUPIUri) {
      finalDTO.upiDetails = upiDetails;
    }
    if (image) {
      finalDTO.imageAnalyzed = true;
    }

    return NextResponse.json(finalDTO, { status: 200 });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[UPI-Shield API Error]', message);

    return NextResponse.json(
      {
        error: 'Analysis temporarily unavailable',
        message: 'Unable to analyze message at this time. Please try again shortly.',
      },
      { status: 503 }
    );
  }
}
