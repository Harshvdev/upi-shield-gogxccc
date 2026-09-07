'use client';

import React from 'react';
import { RiskLevel, ScamType } from '@/lib/ai/types';

interface RiskBadgeProps {
  level: RiskLevel;
  scamType: ScamType;
  scamDetected: boolean;
}

const SCAM_TYPE_LABELS: Record<ScamType, string> = {
  refund_verification: 'Refund Verification Fraud',
  fake_authority: 'Institutional Impersonation',
  account_threat: 'Account Suspension Threat',
  credential_theft: 'UPI PIN / Credential Theft',
  impersonation: 'Identity Impersonation',
  payment_request: 'Deceptive Payment Request',
  other: 'Social Engineering Pattern',
  none: 'Legitimate / Benign Communication',
};

export function RiskBadge({ scamType }: RiskBadgeProps) {
  const label = SCAM_TYPE_LABELS[scamType] || scamType;
  if (!label || scamType === 'none') return null;

  return (
    <div className="text-[12px] text-[var(--ink-faint)]">
      Pattern: <span className="text-[var(--ink-soft)] font-medium">{label}</span>
    </div>
  );
}
