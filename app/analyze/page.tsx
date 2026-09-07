'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageSource, AnalysisResponseDTO } from '@/lib/ai/types';
import { DEMO_SCENARIOS, DemoScenario } from '@/lib/demo/examples';
import { SourceSelector } from '@/components/analyzer/SourceSelector';
import { MessageInput } from '@/components/analyzer/MessageInput';
import { ExampleMessages } from '@/components/analyzer/ExampleMessages';
import { AnalyzeButton } from '@/components/analyzer/AnalyzeButton';
import { AnalysisResult } from '@/components/results/AnalysisResult';
import { ScreenshotData } from '@/components/analyzer/ScreenshotUploader';
import { SafetyGuidelineModal } from '@/components/ui/SafetyGuidelineModal';
import Link from 'next/link';

function AnalyzePageContent() {
  const searchParams = useSearchParams();

  const scenarioParam = searchParams.get('scenario');
  const textParam = searchParams.get('text');
  const sourceParam = searchParams.get('source') as MessageSource | null;
  const initialScenario = scenarioParam ? DEMO_SCENARIOS.find((s) => s.id === scenarioParam) : null;

  const [source, setSource] = useState<MessageSource>(() => {
    if (initialScenario) return initialScenario.source;
    if (sourceParam && ['sms', 'whatsapp', 'payment_note', 'upi_intent', 'screenshot'].includes(sourceParam)) {
      return sourceParam;
    }
    return 'sms';
  });

  const [text, setText] = useState<string>(() => {
    if (initialScenario) return initialScenario.text;
    if (textParam) return decodeURIComponent(textParam);
    return '';
  });

  const [screenshot, setScreenshot] = useState<ScreenshotData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponseDTO | null>(null);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState<boolean>(false);

  const handleAnalyze = React.useCallback(async () => {
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
  }, [text, screenshot, source]);

  // Handle auto-analysis from URL parameter if requested
  useEffect(() => {
    const autoParam = searchParams.get('auto');
    if (autoParam === 'true' || autoParam === '1') {
      const timer = setTimeout(() => {
        handleAnalyze();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [searchParams, handleAnalyze]);

  const handleSelectScenario = (scenario: DemoScenario) => {
    setSource(scenario.source);
    setText(scenario.text);
    setScreenshot(null);
    setError(null);
    setResult(null);
  };

  const handleReset = () => {
    setResult(null);
    setText('');
    setScreenshot(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-[var(--line)] py-[18px] px-6">
        <div className="max-w-[680px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-[13px] text-[var(--ink-soft)] hover:text-[var(--navy)] underline underline-offset-2 transition-colors cursor-pointer"
            >
              ← Home
            </Link>
            <span className="font-serif-doc font-semibold text-[19px] text-[var(--ink)] tracking-tight">
              UPI-Shield Scanner
            </span>
          </div>

          <div className="flex items-center gap-4 text-[13px]">
            <button
              type="button"
              onClick={() => setIsGuidelinesOpen(true)}
              className="text-[var(--ink-soft)] hover:text-[var(--navy)] underline underline-offset-2 transition-colors cursor-pointer bg-transparent border-0 p-0"
            >
              UPI Rules
            </button>

            <a
              href="tel:1930"
              className="text-[var(--ink-soft)] border-b border-[var(--line)] pb-[1px] hover:border-[var(--stamp)] transition-colors"
            >
              Cyber helpline <strong className="text-[var(--stamp)] font-semibold">1930</strong>
            </a>
          </div>
        </div>
      </header>

      {/* Main Single Column Layout */}
      <main className="flex-1 w-full max-w-[680px] mx-auto px-6 pt-10 sm:pt-14 pb-20 text-left">
        <h1 className="font-serif-doc font-semibold text-[30px] sm:text-[34px] leading-[1.25] tracking-[-0.01em] text-[var(--ink)] mb-3 max-w-[15ch]">
          Before you pay, check the message.
        </h1>

        <p className="text-[16px] text-[var(--ink-soft)] max-w-[46ch] mb-9 leading-relaxed">
          Paste what you received. We&apos;ll tell you if it&apos;s trying to rush, scare, or trick you into sending money.
        </p>

        {/* Channel Tabs */}
        <SourceSelector
          selected={source}
          onChange={(s) => {
            setSource(s);
            setError(null);
          }}
          disabled={loading}
        />

        {/* Form Textarea / Screenshot Input */}
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

        {/* Preset Examples */}
        <ExampleMessages
          onSelect={handleSelectScenario}
          disabled={loading}
        />

        {/* Error Notice */}
        {error && (
          <div className="mb-4 p-3 rounded-[6px] border border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--stamp)] text-[13px]">
            {error}
          </div>
        )}

        {/* Action Check Button */}
        <div className="mt-2">
          <AnalyzeButton
            loading={loading}
            disabled={text.trim().length < 1 && !screenshot}
            onClick={handleAnalyze}
          />
        </div>

        {/* Verdict & Analysis Result */}
        {result && (
          <>
            <hr className="divider" />
            <AnalysisResult result={result} onReset={handleReset} />
          </>
        )}
      </main>

      {/* Safety Guidelines Modal */}
      <SafetyGuidelineModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-[var(--line)] py-5 px-6 text-center text-[12.5px] text-[var(--ink-faint)] mt-auto">
        UPI-Shield analyzes message text only. It does not access your bank account or send payments.
      </footer>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">
          Loading UPI-Shield Scanner...
        </div>
      }
    >
      <AnalyzePageContent />
    </Suspense>
  );
}
