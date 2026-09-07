'use client';

import React from 'react';
import { ParsedUPIIntent } from '@/lib/upi/intent';
import { AlertTriangle } from 'lucide-react';

interface UPIIntentCardProps {
  intent: ParsedUPIIntent;
}

export function UPIIntentCard({ intent }: UPIIntentCardProps) {
  if (!intent.isUPIUri) return null;

  return (
    <div className="rounded-[6px] border border-[var(--line)] bg-white p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5">
        <div>
          <span className="text-[13px] font-semibold text-[var(--ink)] block">
            UPI Intent Parameters (NPCI format)
          </span>
          <span className="text-[12px] text-[var(--ink-soft)]">
            Decoded directly from URI payload
          </span>
        </div>

        {intent.amount && (
          <div className="text-right">
            <span className="text-[11px] text-[var(--ink-faint)] block">Requested</span>
            <span className="font-mono font-semibold text-[15px] text-[var(--stamp)]">
              ₹{intent.amount} {intent.currency || 'INR'}
            </span>
          </div>
        )}
      </div>

      {/* Parameter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]">
        <div className="p-2.5 rounded-[4px] border border-[var(--line)] bg-[var(--paper)]">
          <span className="text-[11px] text-[var(--ink-faint)] block uppercase">
            Payee VPA (pa)
          </span>
          <span className="font-mono text-[var(--ink)] break-all">
            {intent.payeeAddress || 'Not specified'}
          </span>
        </div>

        <div className="p-2.5 rounded-[4px] border border-[var(--line)] bg-[var(--paper)]">
          <span className="text-[11px] text-[var(--ink-faint)] block uppercase">
            Payee Name (pn)
          </span>
          <span className="text-[var(--ink)]">
            {intent.payeeName || 'Not specified'}
          </span>
        </div>

        {intent.transactionNote && (
          <div className="sm:col-span-2 p-2.5 rounded-[4px] border border-[var(--line)] bg-[var(--paper)]">
            <span className="text-[11px] text-[var(--ink-faint)] block uppercase">
              Transaction Note (tn)
            </span>
            <span className="text-[var(--ink-soft)] italic">&ldquo;{intent.transactionNote}&rdquo;</span>
          </div>
        )}
      </div>

      {/* Heuristic Alerts */}
      {intent.heuristicFlags.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {intent.heuristicFlags.map((flag) => {
            const isHigh = flag.severity === 'HIGH';

            return (
              <div
                key={flag.id}
                className={`p-2.5 rounded-[4px] border text-[12px] flex items-start gap-2 ${
                  isHigh
                    ? 'bg-[var(--danger-bg)] border-[var(--danger-border)] text-[var(--danger)]'
                    : 'bg-[var(--warn-bg)] border-[var(--warn-border)] text-[var(--warn)]'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-medium block">{flag.title}</strong>
                  <span className="opacity-90">{flag.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
