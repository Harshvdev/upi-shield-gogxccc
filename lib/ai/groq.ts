import Groq from 'groq-sdk';
import { RawAIAnalysis, ScamAnalysisInput } from './types';
import { ScamAnalysisSchema } from './schema';
import { SYSTEM_PROMPT, buildAnalysisUserPrompt } from './prompt';

const GROQ_SYSTEM_INSTRUCTION = `${SYSTEM_PROMPT}

You MUST return a pure JSON object adhering STRICTLY to this structure:
{
  "scamDetected": true,
  "triggers": {
    "urgency": false,
    "authorityImpersonation": false,
    "paymentRequest": true,
    "coercion": false,
    "sensitiveInfoRequest": false,
    "impersonation": false
  },
  "confidence": {
    "urgency": 0.0,
    "authorityImpersonation": 0.0,
    "paymentRequest": 0.95,
    "coercion": 0.0,
    "sensitiveInfoRequest": 0.0,
    "impersonation": 0.0
  },
  "evidence": ["Quoted evidence from message..."],
  "scamType": "refund_verification",
  "englishWarning": "Clear safety warning in English...",
  "hindiWarning": "हिंदी में प्राकृतिक सुरक्षा चेतावनी...",
  "recommendedAction": "Action step for user..."
}

CRITICAL: triggers must be booleans (true/false). confidence must be an object with numeric values between 0.0 and 1.0 for each of the 6 trigger keys.`;

export class GroqProvider {
  readonly name = 'groq' as const;
  private client: Groq;
  private modelName: string;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }
    this.client = new Groq({ apiKey });
    this.modelName = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';
  }

  async analyze(input: ScamAnalysisInput): Promise<RawAIAnalysis> {
    const chatCompletion = await this.client.chat.completions.create({
      model: this.modelName,
      max_tokens: 800,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: GROQ_SYSTEM_INSTRUCTION,
        },
        {
          role: 'user',
          content: buildAnalysisUserPrompt(input.text, input.source),
        },
      ],
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response received from Groq');
    }

    const rawJson = JSON.parse(content);
    const sanitized = this.sanitizeOutput(rawJson);
    return ScamAnalysisSchema.parse(sanitized) as RawAIAnalysis;
  }

  private sanitizeOutput(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const triggerKeys = [
      'urgency',
      'authorityImpersonation',
      'paymentRequest',
      'coercion',
      'sensitiveInfoRequest',
      'impersonation',
    ];

    // Sanitize triggers to strict booleans
    const rawTriggers = data.triggers || {};
    const sanitizedTriggers: Record<string, boolean> = {};
    for (const key of triggerKeys) {
      const val = rawTriggers[key];
      sanitizedTriggers[key] =
        typeof val === 'boolean'
          ? val
          : typeof val === 'number'
          ? val > 0.3
          : typeof val === 'string'
          ? val.toLowerCase() === 'true'
          : false;
    }

    // Sanitize confidence to strict numbers per trigger
    const rawConfidence = data.confidence;
    const sanitizedConfidence: Record<string, number> = {};
    if (typeof rawConfidence === 'number') {
      for (const key of triggerKeys) {
        sanitizedConfidence[key] = sanitizedTriggers[key] ? rawConfidence : 0;
      }
    } else if (rawConfidence && typeof rawConfidence === 'object') {
      for (const key of triggerKeys) {
        const val = Number(rawConfidence[key]);
        sanitizedConfidence[key] = isNaN(val)
          ? sanitizedTriggers[key]
            ? 0.8
            : 0.0
          : Math.min(1, Math.max(0, val));
      }
    } else {
      for (const key of triggerKeys) {
        sanitizedConfidence[key] = sanitizedTriggers[key] ? 0.85 : 0.0;
      }
    }

    // Sanitize evidence
    let evidence = data.evidence;
    if (!Array.isArray(evidence)) {
      evidence = typeof evidence === 'string' ? [evidence] : [];
    }

    return {
      scamDetected: Boolean(data.scamDetected),
      triggers: sanitizedTriggers,
      confidence: sanitizedConfidence,
      evidence: evidence.slice(0, 6),
      scamType: data.scamType || 'other',
      englishWarning: data.englishWarning || 'Exercise extreme caution before making payments.',
      hindiWarning: data.hindiWarning || 'भुगतान करने से पहले अत्यधिक सावधानी बरतें।',
      recommendedAction: data.recommendedAction || 'Do not transfer funds. Verify with your official bank app.',
    };
  }
}
