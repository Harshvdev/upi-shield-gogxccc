'use client';

import React from 'react';
import { Shield, X, PhoneCall, ExternalLink, AlertTriangle, KeyRound, QrCode, Smartphone, Clock } from 'lucide-react';

interface SafetyGuidelineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SafetyGuidelineModal({ isOpen, onClose }: SafetyGuidelineModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-[#0c1017] text-slate-100 p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                UPI Cyber Defense & Golden Rules
              </h3>
              <p className="text-xs text-slate-400">
                National Cyber Crime Prevention Initiative • Citizen Security Protocol
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency Hotline Banner */}
        <div className="p-4 sm:p-5 rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 to-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm uppercase tracking-wider">
              <PhoneCall className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>National Cyber Fraud Helpline: 1930</span>
            </div>
            <p className="text-xs text-slate-300">
              Victim of an unauthorized UPI debit? Act in the <strong>Golden Hour (within 2 hours)</strong> to halt fund transfer.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="tel:1930"
              className="flex-1 sm:flex-initial text-center px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-colors"
            >
              Dial 1930
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              <span>Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 5 Golden Rules Grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            5 Non-Negotiable Golden Rules of UPI
          </h4>

          <div className="space-y-2.5">
            <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">
                  1. UPI PIN is strictly for SENDING money
                </h5>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  You never need to enter your UPI PIN to receive money, collect cashbacks, or accept refunds. Any message claiming you must enter PIN or pay ₹1 to receive money is 100% fraudulent.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">
                  2. Scanning a QR Code always DEBITS your account
                </h5>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Scammers send QR codes claiming &quot;Scan this to receive payment for your listing&quot;. Scanning a QR code only transfers funds away from you.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">
                  3. Verify personal vs institutional VPA handles
                </h5>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Official departments never ask you to transfer funds to personal handles ending in @paytm, @okaxis, @ybl, or @ibl. Genuine utilities have registered verified merchant codes.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">
                  4. Never install remote screen-sharing apps
                </h5>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Scammers pretending to be customer care will ask you to download AnyDesk, RustDesk, or QuickSupport to &quot;fix UPI KYC&quot;. This gives them full access to your screen and SMS OTPs.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">
                  5. Artificial urgency is the biggest scam red flag
                </h5>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Phrases like &quot;account blocked in 10 minutes&quot;, &quot;electricity disconnected tonight&quot;, or &quot;legal warrant issued&quot; are designed to panic you into acting without verifying.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
