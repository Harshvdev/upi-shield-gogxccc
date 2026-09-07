'use client';

import React from 'react';
import { AnalysisResponseDTO } from '@/lib/ai/types';
import { ThreatMeter } from './ThreatMeter';
import { SafetyCard } from './SafetyCard';
import { TriggerList } from './TriggerList';
import { EvidenceList } from './EvidenceList';
import { UPIIntentCard } from '../analyzer/UPIIntentCard';

interface AnalysisResultProps {
  result: AnalysisResponseDTO;
  onReset: () => void;
}

export function AnalysisResult({ result, onReset }: AnalysisResultProps) {
  const getVerdictHeadline = () => {
    if (result.riskLevel === 'HIGH') {
      if (result.scamType === 'refund_verification') {
        return 'This message is a refund verification trap';
      }
      if (result.scamType === 'account_threat') {
        return 'This message is using fear to rush you';
      }
      if (result.scamType === 'fake_authority') {
        return 'This message is impersonating an official authority';
      }
      return 'This message is built to rush you';
    }
    if (result.riskLevel === 'MEDIUM') {
      return 'Suspicious characteristics detected';
    }
    return 'No deceptive patterns detected';
  };

  const getVerdictSubtext = () => {
    if (result.riskLevel === 'HIGH') {
      return 'Fake authority, a countdown, and a payment link — the classic shape of a UPI scam.';
    }
    if (result.riskLevel === 'MEDIUM') {
      return 'Contains coercive or unverified elements. Verify the sender through official banking channels before paying.';
    }
    return 'The language in this message does not match known UPI coercion or social engineering patterns.';
  };

  return (
    <div id="result" className="space-y-8 animate-in fade-in duration-300">
      {/* Verdict Row */}
      <div className="flex items-start sm:items-center gap-6">
        <ThreatMeter score={result.riskScore} level={result.riskLevel} />

        <div className="flex-1 min-w-0">
          <h2 className="font-serif-doc text-[22px] sm:text-[24px] font-semibold text-[var(--ink)] leading-snug m-0 mb-1">
            {getVerdictHeadline()}
          </h2>
          <p className="text-[14px] text-[var(--ink-soft)] leading-relaxed m-0">
            {getVerdictSubtext()}
          </p>
          <button
            type="button"
            onClick={onReset}
            className="text-[13px] text-[var(--ink-faint)] hover:text-[var(--navy)] underline underline-offset-2 transition-colors cursor-pointer bg-transparent border-0 p-0 mt-2 block"
          >
            Check a different message
          </button>
        </div>
      </div>

      {/* What to do now (Advisory) */}
      <SafetyCard
        englishWarning={result.englishWarning}
        hindiWarning={result.hindiWarning}
        recommendedAction={result.recommendedAction}
        riskLevel={result.riskLevel}
      />

      {/* Why was this flagged? (Triggers) */}
      <TriggerList triggers={result.triggerDetails} />

      {/* Quoted from the message (Evidence) */}
      {result.evidence && result.evidence.length > 0 && (
        <EvidenceList evidence={result.evidence} />
      )}

      {/* Parsed UPI Intent Slip if applicable */}
      {result.upiDetails && (
        <UPIIntentCard intent={result.upiDetails} />
      )}

      {/* Deterministic Safeguards Log */}
      {result.appliedRules && result.appliedRules.length > 0 && (
        <div className="border-t border-[var(--line)] pt-4 text-[12px] text-[var(--ink-soft)]">
          <span className="font-medium text-[var(--ink)] block mb-1">
            Deterministic risk safeguards applied:
          </span>
          <ul className="list-disc list-inside space-y-0.5 pl-1">
            {result.appliedRules.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
