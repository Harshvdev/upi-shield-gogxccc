import { GeminiProvider } from './gemini';
import { GroqProvider } from './groq';
import { RawAIAnalysis, ScamAnalysisInput } from './types';

export interface ProviderExecutionResult {
  analysis: RawAIAnalysis;
  providerUsed: 'gemini' | 'groq';
  errorLog?: string[];
}

export async function executeScamAnalysis(
  input: ScamAnalysisInput
): Promise<ProviderExecutionResult> {
  const errors: string[] = [];

  // 1. Primary AI: Google Gemini 3.8 Flash
  try {
    const gemini = new GeminiProvider();
    const result = await gemini.analyze(input);
    return {
      analysis: result,
      providerUsed: 'gemini',
    };
  } catch (geminiError) {
    const geminiMsg = geminiError instanceof Error ? geminiError.message : String(geminiError);
    errors.push(`Gemini Provider: ${geminiMsg}`);
    console.warn(`[UPI-Shield Failover] Gemini failed (${geminiMsg}). Activating Groq Qwen 3.8 27B fallback...`);

    // 2. Fallback AI: Groq Qwen 3.8 27B
    try {
      const groq = new GroqProvider();
      const groqResult = await groq.analyze(input);
      return {
        analysis: groqResult,
        providerUsed: 'groq',
        errorLog: errors,
      };
    } catch (groqError) {
      const groqMsg = groqError instanceof Error ? groqError.message : String(groqError);
      errors.push(`Groq Provider: ${groqMsg}`);
      console.error(`[UPI-Shield Error] Both AI providers failed. Gemini: ${geminiMsg} | Groq: ${groqMsg}`);
      throw new Error(
        `AI Providers unavailable. Gemini: ${geminiMsg} | Groq: ${groqMsg}`
      );
    }
  }
}
