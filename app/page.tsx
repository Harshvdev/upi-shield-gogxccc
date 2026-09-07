'use client';

import React, { useState } from 'react';
import { MessageSource, AnalysisResponseDTO } from '@/lib/ai/types';
import { DemoScenario } from '@/lib/demo/examples';
import { SourceSelector } from '@/components/analyzer/SourceSelector';
import { MessageInput } from '@/components/analyzer/MessageInput';
import { ExampleMessages } from '@/components/analyzer/ExampleMessages';
import { AnalyzeButton } from '@/components/analyzer/AnalyzeButton';
import { AnalysisResult } from '@/components/results/AnalysisResult';
import { ScreenshotData } from '@/components/analyzer/ScreenshotUploader';
import { SafetyGuidelineModal } from '@/components/ui/SafetyGuidelineModal';
import { Shield, ShieldCheck, Lock, AlertCircle, Sparkles, PhoneCall, HelpCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [source, setSource] = useState<MessageSource>('sms');
  const [text, setText] = useState<string>('');
  const [screenshot, setScreenshot] = useState<ScreenshotData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponseDTO | null>(null);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState<boolean>(false);

  const handleSelectScenario = (scenario: DemoScenario) => {
    setSource(scenario.source);
    setText(scenario.text);
    setScreenshot(null);
    setError(null);
    setResult(null);
  };

  const handleAnalyze = async () => {
    const hasText = text.trim().length >= 1;
    const hasImage = Boolean(screenshot);

    if (!hasText && !hasImage) {
      setError('Please enter message text or upload a screenshot to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim() || 'Attached screenshot analysis request',
          source,
          image: screenshot
            ? {
                base64: screenshot.base64,
                mimeType: screenshot.mimeType,
              }
            : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError(
            data.message ||
              'Rate limit exceeded. Please wait a few seconds before trying again.'
          );
        } else {
          setError(
            data.details ||
              data.message ||
              'Unable to complete analysis. Please check your connection and try again.'
          );
        }
        return;
      }

      setResult(data as AnalysisResponseDTO);
    } catch {
      setError('Network connection error. Please verify the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setText('');
    setScreenshot(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#07090e] bg-grid-pattern relative flex flex-col">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-blue-600/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  UPI-SHIELD
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-500/15 border border-blue-500/30 text-blue-300">
                  AI DEFENSE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Zero-Trust UPI Scam & Psychological Manipulation Detection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <Link
              href="/analyze"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-[11px] hover:border-blue-500/60 hover:text-white transition-colors"
            >
              <span>Dedicated Scanner</span>
              <ArrowUpRight className="w-3 h-3 text-blue-400" />
            </Link>

            <button
              type="button"
              onClick={() => setIsGuidelinesOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-[11px] hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3 h-3 text-blue-400" />
              <span>UPI Rules</span>
            </button>

            <a
              href="tel:1930"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-500/40 text-rose-300 text-[11px] font-semibold hover:bg-rose-900/50 transition-colors"
            >
              <PhoneCall className="w-3 h-3 text-rose-400 animate-pulse" />
              <span>Helpline 1930</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 z-10">
        {/* Hero Section */}
        <section className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Dual-Provider: Gemini 3.8 Flash + Groq Qwen Failover • Bun Powered</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Stop UPI Payment Scams <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
              Before You Authorize
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Ingest suspicious SMS, WhatsApp, UPI collect notes, raw <code className="text-blue-300 font-mono text-xs">upi://pay</code> intents, or mobile screenshots. Our semantic engine flags deceptive triggers, computes an explainable 0–100 threat score, and generates bilingual safety cards.
          </p>
        </section>

        {/* Dynamic State: Show Input Form OR Analysis Result */}
        {!result ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-5 sm:p-8 space-y-6 shadow-2xl">
            {/* Source / Channel selector */}
            <SourceSelector
              selected={source}
              onChange={(s) => {
                setSource(s);
                setError(null);
              }}
              disabled={loading}
            />

            {/* Instant Demo Presets */}
            <ExampleMessages
              onSelect={handleSelectScenario}
              disabled={loading}
            />

            {/* Message Input Box with Screenshot and UPI Intent integration */}
            <MessageInput
              value={text}
              source={source}
              onChange={setText}
              onClear={() => setText('')}
              onSubmit={handleAnalyze}
              disabled={loading}
              screenshot={screenshot}
              onScreenshotChange={setScreenshot}
              onSourceChange={setSource}
            />

            {/* Error Message if any */}
            {error && (
              <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 text-rose-300 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block">Analysis Notice</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <AnalyzeButton
              loading={loading}
              disabled={text.trim().length < 1 && !screenshot}
              onClick={handleAnalyze}
            />

            {/* Architectural badge */}
            <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Deterministic Risk Engine: Scoring is calculated mathematically in app code, not guessed by AI.
              </span>
            </div>
          </div>
        ) : (
          <AnalysisResult result={result} onReset={handleReset} />
        )}

        {/* Feature & Architecture Highlights */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/30 backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              1. Semantic Triggers
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Detects urgency, authority claims, coercion, and nominal fee tricks without relying on primitive keyword blacklists.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/30 backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              2. Risk Engine (0–100)
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Calculates threat scores using transparent policy weights: Payment (25), Coercion (20), Authority (15), PIN (15).
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/30 backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              3. Bilingual Safety Cards
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Produces simultaneous English and natural Hindi warnings with voice readouts and 1-click WhatsApp alerts.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/30 backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              4. Intent & Multimodal OCR
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Decodes raw <code className="text-cyan-300 font-mono text-[11px]">upi://pay</code> URIs and inspects screenshot images directly via Gemini 3.8 Flash.
            </p>
          </div>
        </section>
      </main>

      {/* Safety Guidelines Modal */}
      <SafetyGuidelineModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-slate-400">UPI-Shield</span>
            <span>• National Cyber Safety Initiative</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Remember: UPI PIN is ONLY needed to SEND money, never to receive refunds or cashback.
          </p>
        </div>
      </footer>
    </div>
  );
}
