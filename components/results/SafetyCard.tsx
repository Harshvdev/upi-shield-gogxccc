'use client';

import React, { useState } from 'react';
import { RiskLevel } from '@/lib/ai/types';
import { ShieldAlert, Languages, Copy, Check, Volume2, ShieldCheck, ArrowRight, Share2 } from 'lucide-react';


interface SafetyCardProps {
  englishWarning: string;
  hindiWarning: string;
  recommendedAction: string;
  riskLevel: RiskLevel;
}

export function SafetyCard({
  englishWarning,
  hindiWarning,
  recommendedAction,
  riskLevel,
}: SafetyCardProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'both' | 'en' | 'hi'>('both');
  const [speaking, setSpeaking] = useState(false);

  const isHigh = riskLevel === 'HIGH';

  const handleCopy = async () => {
    const textToCopy = `⚠️ UPI-SHIELD SECURITY ADVISORY ⚠️
Risk Level: ${riskLevel}
English: ${englishWarning}

हिंदी: ${hindiWarning}

Recommended Action: ${recommendedAction}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleShareWhatsApp = () => {
    const textToShare = `⚠️ *UPI-SHIELD CYBER ADVISORY* ⚠️\n*Threat Level:* ${riskLevel}\n\n*Warning (English):*\n${englishWarning}\n\n*चेतावनी (हिंदी):*\n${hindiWarning}\n\n*Recommended Action:* ${recommendedAction}\n\n_Protected by UPI-Shield Zero-Trust Engine_`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
    window.open(url, '_blank');
  };

  const handleSpeak = (text: string, lang: string) => {

    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (speaking) {
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all ${
        isHigh
          ? 'bg-rose-950/20 border-rose-500/40 shadow-xl shadow-rose-950/20'
          : riskLevel === 'MEDIUM'
          ? 'bg-amber-950/20 border-amber-500/40 shadow-xl shadow-amber-950/20'
          : 'bg-emerald-950/20 border-emerald-500/40 shadow-xl shadow-emerald-950/20'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl ${
              isHigh
                ? 'bg-rose-500/20 text-rose-400'
                : riskLevel === 'MEDIUM'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            {isHigh ? (
              <ShieldAlert className="w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Bilingual Safety Advisory</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                English & हिन्दी
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Instant bilingual guidance to prevent unauthorized UPI debit
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Language filter pills */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('both')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'both'
                  ? 'bg-slate-700 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('en')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'en'
                  ? 'bg-slate-700 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('hi')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'hi'
                  ? 'bg-slate-700 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              हिंदी
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            title="Copy advisory to clipboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/80 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            title="Forward warning to WhatsApp"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-600/60 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

        </div>
      </div>

      {/* Recommended Action Banner */}
      <div className="mt-4 p-3.5 rounded-xl border border-blue-500/30 bg-blue-950/20 text-blue-200 flex items-start gap-2.5">
        <ArrowRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <span className="font-bold text-blue-300 uppercase text-[11px] tracking-wider block sm:inline mr-2">
            Recommended Action:
          </span>
          <span className="text-slate-200 font-medium">{recommendedAction}</span>
        </div>
      </div>

      {/* Warning Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
        {/* English Warning */}
        {(activeTab === 'both' || activeTab === 'en') && (
          <div className="p-4 rounded-xl border border-slate-800/90 bg-slate-900/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  English Safety Warning
                </span>
                <button
                  type="button"
                  onClick={() => handleSpeak(englishWarning, 'en-US')}
                  className="text-slate-500 hover:text-blue-400 transition-colors p-1 cursor-pointer"
                  title="Listen in English"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                {englishWarning}
              </p>
            </div>
          </div>
        )}

        {/* Hindi Warning */}
        {(activeTab === 'both' || activeTab === 'hi') && (
          <div className="p-4 rounded-xl border border-slate-800/90 bg-slate-900/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5" />
                  <span>हिंदी सुरक्षा चेतावनी</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleSpeak(hindiWarning, 'hi-IN')}
                  className="text-slate-500 hover:text-amber-400 transition-colors p-1 cursor-pointer"
                  title="हिंदी में सुनें"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                {hindiWarning}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
