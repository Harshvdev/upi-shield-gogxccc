'use client';

import React from 'react';
import { RiskLevel, ScamType } from '@/lib/ai/types';
import { ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react';

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
  none: 'Legitimate / Benign Content',
};

export function RiskBadge({ level, scamType, scamDetected }: RiskBadgeProps) {
  const isHigh = level === 'HIGH';
  const isMedium = level === 'MEDIUM';

  const badgeConfig = isHigh
    ? {
        border: 'border-rose-500/50',
        bg: 'bg-rose-500/10 text-rose-300',
        icon: ShieldAlert,
        glow: 'shadow-lg shadow-rose-500/20',
        dot: 'bg-rose-500',
      }
    : isMedium
    ? {
        border: 'border-amber-500/50',
        bg: 'bg-amber-500/10 text-amber-300',
        icon: AlertTriangle,
        glow: 'shadow-lg shadow-amber-500/20',
        dot: 'bg-amber-500',
      }
    : {
        border: 'border-emerald-500/50',
        bg: 'bg-emerald-500/10 text-emerald-300',
        icon: ShieldCheck,
        glow: 'shadow-lg shadow-emerald-500/20',
        dot: 'bg-emerald-500',
      };

  const Icon = badgeConfig.icon;

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${badgeConfig.bg} ${badgeConfig.border} ${badgeConfig.glow}`}
      >
        <span className={`w-2 h-2 rounded-full ${badgeConfig.dot} animate-pulse`} />
        <Icon className="w-4 h-4" />
        <span>{level} RISK</span>
      </div>

      <div className="px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900/60 text-xs font-medium text-slate-300">
        Pattern: <span className="text-white font-semibold">{SCAM_TYPE_LABELS[scamType] || scamType}</span>
      </div>

      {scamDetected && (
        <span className="text-[11px] px-2.5 py-1 rounded-md bg-rose-950/60 text-rose-400 border border-rose-800/40">
          Scam Flags Triggered
        </span>
      )}
    </div>
  );
}
