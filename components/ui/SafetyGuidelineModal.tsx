'use client';

import React from 'react';
import { X, PhoneCall } from 'lucide-react';

interface SafetyGuidelineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SafetyGuidelineModal({ isOpen, onClose }: SafetyGuidelineModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#201F1C]/40 backdrop-blur-[2px]">
      <div
        className="relative w-full max-w-xl rounded-[8px] border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] p-6 sm:p-7 space-y-5 shadow-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-3.5">
          <div>
            <h3 className="font-serif-doc text-[20px] font-semibold text-[var(--ink)] m-0">
              UPI Safety Rules
            </h3>
            <p className="text-[12px] text-[var(--ink-soft)] mt-0.5 m-0">
              Official citizen protocol for verifying payment requests
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[var(--ink-faint)] hover:text-[var(--ink)] p-1 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency Hotline Banner */}
        <div className="p-3.5 rounded-[6px] border border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--ink)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-[var(--stamp)] font-semibold text-[13px]">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>National Cyber Crime Helpline: 1930</span>
            </div>
            <p className="text-[12px] text-[var(--ink-soft)] mt-0.5 m-0">
              Act within the <strong>Golden Hour (2 hours)</strong> to halt fund transfers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="tel:1930"
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-[4px] bg-[var(--stamp)] text-white text-[12px] font-medium transition-colors hover:opacity-90"
            >
              Call 1930
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-[4px] border border-[var(--line)] bg-white text-[var(--ink)] text-[12px] font-medium hover:border-[var(--navy)] transition-colors"
            >
              Portal
            </a>
          </div>
        </div>

        {/* 5 Golden Rules Grid */}
        <div className="space-y-2.5">
          <h4 className="text-[13px] font-semibold text-[var(--ink)] uppercase tracking-wider">
            5 Golden Rules of UPI
          </h4>

          <div className="space-y-2">
            <div className="p-3 rounded-[6px] border border-[var(--line)] bg-white">
              <h5 className="text-[13px] font-semibold text-[var(--ink)] m-0">
                1. UPI PIN is strictly for SENDING money
              </h5>
              <p className="text-[12px] text-[var(--ink-soft)] mt-1 m-0 leading-relaxed">
                You never need to enter your UPI PIN to receive money, collect cashbacks, or accept refunds. Any message claiming you must enter PIN or pay ₹1 to receive money is 100% fraudulent.
              </p>
            </div>

            <div className="p-3 rounded-[6px] border border-[var(--line)] bg-white">
              <h5 className="text-[13px] font-semibold text-[var(--ink)] m-0">
                2. Scanning a QR Code always DEBITS your account
              </h5>
              <p className="text-[12px] text-[var(--ink-soft)] mt-1 m-0 leading-relaxed">
                Scammers send QR codes claiming &quot;Scan this to receive payment for your listing&quot;. Scanning a QR code only transfers funds away from you.
              </p>
            </div>

            <div className="p-3 rounded-[6px] border border-[var(--line)] bg-white">
              <h5 className="text-[13px] font-semibold text-[var(--ink)] m-0">
                3. Verify personal vs institutional VPA handles
              </h5>
              <p className="text-[12px] text-[var(--ink-soft)] mt-1 m-0 leading-relaxed">
                Official departments never ask you to transfer funds to personal handles ending in @paytm, @okaxis, @ybl, or @ibl. Genuine utilities have registered verified merchant codes.
              </p>
            </div>

            <div className="p-3 rounded-[6px] border border-[var(--line)] bg-white">
              <h5 className="text-[13px] font-semibold text-[var(--ink)] m-0">
                4. Never install remote screen-sharing apps
              </h5>
              <p className="text-[12px] text-[var(--ink-soft)] mt-1 m-0 leading-relaxed">
                Scammers pretending to be customer care will ask you to download AnyDesk, RustDesk, or QuickSupport to &quot;fix UPI KYC&quot;. This gives them full access to your screen and SMS OTPs.
              </p>
            </div>

            <div className="p-3 rounded-[6px] border border-[var(--line)] bg-white">
              <h5 className="text-[13px] font-semibold text-[var(--ink)] m-0">
                5. Artificial urgency is the biggest scam red flag
              </h5>
              <p className="text-[12px] text-[var(--ink-soft)] mt-1 m-0 leading-relaxed">
                Phrases like &quot;account blocked in 10 minutes&quot;, &quot;electricity disconnected tonight&quot;, or &quot;legal warrant issued&quot; are designed to panic you into acting without verifying.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end border-t border-[var(--line)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[4px] bg-[var(--navy)] hover:bg-[var(--navy-dark)] text-white text-[13px] font-medium transition-colors cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
