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
      setError('Please enter message text or attach a screenshot to check.');
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
              'Rate limit reached. Please wait a few seconds before checking again.'
          );
        } else {
          setError(
            data.details ||
              data.message ||
              'Unable to complete analysis. Please verify your connection.'
          );
        }
        return;
      }

      setResult(data as AnalysisResponseDTO);
      setTimeout(() => {
        document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] flex flex-col">
      {/* Topbar */}
      <header className="border-b border-[var(--line)] py-[18px] px-6">
        <div className="max-w-[680px] mx-auto flex justify-between items-center">
          <span className="font-serif-doc font-semibold text-[19px] text-[var(--ink)] tracking-tight">
            UPI-Shield
          </span>

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

      {/* Main Single Column Layout (max 680px) */}
      <main className="flex-1 w-full max-w-[680px] mx-auto px-6 pt-10 sm:pt-14 pb-20 text-left">
        <h1 className="font-serif-doc font-semibold text-[30px] sm:text-[34px] leading-[1.25] tracking-[-0.01em] text-[var(--ink)] mb-3 max-w-[15ch]">
          Before you pay, check the message.
        </h1>

        <p className="text-[16px] text-[var(--ink-soft)] max-w-[46ch] mb-9 leading-relaxed">
          Paste what you received. We&apos;ll tell you if it&apos;s trying to rush, scare, or trick you into sending money.
        </p>

        {/* Input Form Section */}
        <div>
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
