import { GoogleGenAI, Type } from '@google/genai';
import { RawAIAnalysis, ScamAnalysisInput } from './types';
import { ScamAnalysisSchema } from './schema';
import { SYSTEM_PROMPT, buildAnalysisUserPrompt } from './prompt';

export class GeminiProvider {
  readonly name = 'gemini' as const;
  private client: GoogleGenAI;
  private modelName: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.client = new GoogleGenAI({ apiKey });
    this.modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  }

  async analyze(input: ScamAnalysisInput): Promise<RawAIAnalysis> {
    const userPrompt = buildAnalysisUserPrompt(input.text, input.source);

    // Multimodal payload if screenshot image is present
    let contents: Parameters<typeof this.client.models.generateContent>[0]['contents'] = userPrompt;
    if (input.image) {
      contents = [
        {
          inlineData: {
            data: input.image.base64,
            mimeType: input.image.mimeType,
          },
        },
        {
          text: `${userPrompt}\n\nNote: Inspect the attached screenshot carefully for fake bank/UPI logos, spoofed authority headers, deceptive payment collect dialogs, countdown timers, and manipulated notifications. Extract evidence from both visual cues and visible text.`,
        },
      ];
    }

    const candidateModels = [
      this.modelName,
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
    ].filter((m, i, arr) => arr.indexOf(m) === i);

    let lastError: unknown = null;

    for (const modelToTry of candidateModels) {
      try {
        const response = await this.client.models.generateContent({
          model: modelToTry,
          contents,


      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scamDetected: { type: Type.BOOLEAN },
            triggers: {
              type: Type.OBJECT,
              properties: {
                urgency: { type: Type.BOOLEAN },
                authorityImpersonation: { type: Type.BOOLEAN },
                paymentRequest: { type: Type.BOOLEAN },
                coercion: { type: Type.BOOLEAN },
                sensitiveInfoRequest: { type: Type.BOOLEAN },
                impersonation: { type: Type.BOOLEAN },
              },
              required: [
                'urgency',
                'authorityImpersonation',
                'paymentRequest',
                'coercion',
                'sensitiveInfoRequest',
                'impersonation',
              ],
            },
            confidence: {
              type: Type.OBJECT,
              properties: {
                urgency: { type: Type.NUMBER },
                authorityImpersonation: { type: Type.NUMBER },
                paymentRequest: { type: Type.NUMBER },
                coercion: { type: Type.NUMBER },
                sensitiveInfoRequest: { type: Type.NUMBER },
                impersonation: { type: Type.NUMBER },
              },
              required: [
                'urgency',
                'authorityImpersonation',
                'paymentRequest',
                'coercion',
                'sensitiveInfoRequest',
                'impersonation',
              ],
            },
            evidence: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            scamType: {
              type: Type.STRING,
            },
            englishWarning: { type: Type.STRING },
            hindiWarning: { type: Type.STRING },
            recommendedAction: { type: Type.STRING },
          },
          required: [
            'scamDetected',
            'triggers',
            'confidence',
            'evidence',
            'scamType',
            'englishWarning',
            'hindiWarning',
            'recommendedAction',
          ],
        },
      },
    });

        const rawText = response.text;
        if (!rawText) {
          throw new Error('Empty response received from Gemini');
        }

        const parsedJson = JSON.parse(rawText);
        return ScamAnalysisSchema.parse(parsedJson) as RawAIAnalysis;
      } catch (err) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        // If authentication error, model fallback will not help; rethrow immediately
        if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
          throw err;
        }
        // If model not found (404), continue to next candidate model
        if (msg.includes('not found') || msg.includes('404') || msg.includes('is not supported')) {
          console.warn(`[Gemini Model Fallback] Model ${modelToTry} not found. Trying next candidate...`);
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error('All Gemini candidate models failed.');
  }
}

