import { ParsedUPIIntent } from '../upi/intent';

export type MessageSource =
  | 'sms'
  | 'whatsapp'
  | 'payment_note'
  | 'upi_intent'
  | 'screenshot';

export type ScamType =
  | 'payment_request'
  | 'refund_verification'
  | 'fake_authority'
  | 'account_threat'
  | 'credential_theft'
  | 'impersonation'
  | 'other'
  | 'none';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ScamTriggers {
  urgency: boolean;
  authorityImpersonation: boolean;
  paymentRequest: boolean;
  coercion: boolean;
  sensitiveInfoRequest: boolean;
  impersonation: boolean;
}

export interface TriggerConfidence {
  urgency: number;
  authorityImpersonation: number;
  paymentRequest: number;
  coercion: number;
  sensitiveInfoRequest: number;
  impersonation: number;
}

export interface RawAIAnalysis {
  scamDetected: boolean;
  triggers: ScamTriggers;
  confidence: TriggerConfidence;
  evidence: string[];
  scamType: ScamType;
  englishWarning: string;
  hindiWarning: string;
  recommendedAction: string;
}

export interface TriggerDetail {
  key: keyof ScamTriggers;
  label: string;
  detected: boolean;
  confidence: number;
  weight: number;
  description: string;
}

export interface AnalysisResponseDTO {
  riskLevel: RiskLevel;
  riskScore: number;
  scamDetected: boolean;
  triggers: ScamTriggers;
  confidence: TriggerConfidence;
  triggerDetails: TriggerDetail[];
  evidence: string[];
  scamType: ScamType;
  englishWarning: string;
  hindiWarning: string;
  recommendedAction: string;
  providerUsed: 'gemini' | 'groq';
  appliedRules: string[];
  timestamp: string;
  upiDetails?: ParsedUPIIntent;
  imageAnalyzed?: boolean;
}

export interface ScamAnalysisInput {
  text: string;
  source: MessageSource;
  image?: {
    base64: string;
    mimeType: string;
  };
}

