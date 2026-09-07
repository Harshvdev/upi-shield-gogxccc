'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MessageSource, AnalysisResponseDTO } from '@/lib/ai/types';
import { DEMO_SCENARIOS, DemoScenario } from '@/lib/demo/examples';
import { SourceSelector } from '@/components/analyzer/SourceSelector';
import { MessageInput } from '@/components/analyzer/MessageInput';
import { ExampleMessages } from '@/components/analyzer/ExampleMessages';
import { AnalyzeButton } from '@/components/analyzer/AnalyzeButton';
import { AnalysisResult } from '@/components/results/AnalysisResult';
import { ScreenshotData } from '@/components/analyzer/ScreenshotUploader';
import { SafetyGuidelineModal } from '@/components/ui/SafetyGuidelineModal';
import { Shield, ShieldCheck, Lock, AlertCircle, Sparkles, ArrowLeft, PhoneCall, HelpCircle } from 'lucide-react';
import Link from 'next/link';

function AnalyzePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [source, setSource] = useState<MessageSource>('sms');
  const [text, setText] = useState<string>('');
  const [screenshot, setScreenshot] = useState<ScreenshotData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponseDTO | null>(null);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState<boolean>(false);

  // Initialize from query parameters
  useEffect(() => {
    const scenarioParam = searchParams.get('scenario');
    const textParam = searchParams.get('text');
    const sourceParam = searchParams.get('source') as MessageSource | null;
    const autoParam = searchParams.get('auto');

    if (scenarioParam) {
      const found = DEMO_SCENARIOS.find((s) => s.id === scenarioParam);
      if (found) {
        setSource(found.source);
        setText(found.text);
      }
    } else if (textParam) {
      setText(decodeURIComponent(textParam));
    }

    if (sourceParam && ['sms', 'whatsapp', 'payment_note', 'upi_intent', 'screenshot'].includes(sourceParam)) {
      setSource(sourceParam);
    }

    if (autoParam === 'true' || autoParam === '1') {
      // Trigger auto-analysis after initial state set
      setTimeout(() => {
        handleAnalyze();
      }, 200);
    }
  }, [searchParams]);

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
            <Link
              href="/"
              className="p-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Return to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                UPI-SHIELD SCANNER
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/15 border border-blue-500/30 text-blue-300">
                DEEP SCAN
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setIsGuidelinesOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 text-xs transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">UPI Rules</span>
            </button>

            <a
              href="tel:1930"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/40 bg-rose-950/30 text-rose-300 text-xs font-semibold hover:bg-rose-900/40 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>1930</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 z-10">
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
                  <span className="font-semibold block">Scan Alert</span>
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
                Zero-Trust Deterministic Risk Scoring + Gemini 3.8 Flash Multimodal OCR
              </span>
            </div>
          </div>
        ) : (
          <AnalysisResult result={result} onReset={handleReset} />
        )}
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
            <span>• Zero Data Storage Guaranteed</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Emergency Fraud Reporting: Call 1930 within the Golden Hour to freeze accounts.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-slate-400 text-sm">
          Loading UPI-Shield Scanner...
        </div>
      }
    >
      <AnalyzePageContent />
    </Suspense>
  );
}
