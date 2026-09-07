'use client';

import React from 'react';
import { ParsedUPIIntent } from '@/lib/upi/intent';
import { AlertTriangle, Info, CheckCircle2, QrCode, ArrowUpRight, DollarSign } from 'lucide-react';

interface UPIIntentCardProps {
  intent: ParsedUPIIntent;
}

export function UPIIntentCard({ intent }: UPIIntentCardProps) {
  if (!intent.isUPIUri) return null;

  return (
    <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>UPI Intent Link Detected</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                NPCI Spec
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Parsed parameters & zero-trust heuristic checks
            </p>
          </div>
        </div>

        {intent.amount && (
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Requested Amount
            </span>
            <span className="font-mono font-extrabold text-base text-rose-300">
              ₹{intent.amount} {intent.currency || 'INR'}
            </span>
          </div>
        )}
      </div>

      {/* Parameter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <span className="text-[10px] uppercase text-slate-500 font-semibold block">
            Payee VPA (pa)
          </span>
          <span className="font-mono text-slate-200 break-all">
            {intent.payeeAddress || 'Not specified'}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <span className="text-[10px] uppercase text-slate-500 font-semibold block">
            Payee Name (pn)
          </span>
          <span className="text-slate-200 font-medium">
            {intent.payeeName || 'Not specified'}
          </span>
        </div>

        {intent.transactionNote && (
          <div className="sm:col-span-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] uppercase text-slate-500 font-semibold block">
              Transaction Note (tn)
            </span>
            <span className="text-slate-300 italic">"{intent.transactionNote}"</span>
          </div>
        )}
      </div>

      {/* Heuristic Alerts & Rules */}
      {intent.heuristicFlags.length > 0 && (
        <div className="space-y-2 pt-1">
          {intent.heuristicFlags.map((flag) => {
            const isHigh = flag.severity === 'HIGH';
            const isInfo = flag.severity === 'INFO';

            return (
              <div
                key={flag.id}
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  isHigh
                    ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                    : isInfo
                    ? 'bg-blue-950/40 border-blue-500/30 text-blue-200'
                    : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                }`}
              >
                {isHigh ? (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                ) : isInfo ? (
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-semibold">{flag.title}</div>
                  <div className="text-[11px] opacity-90 mt-0.5 leading-relaxed">
                    {flag.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
