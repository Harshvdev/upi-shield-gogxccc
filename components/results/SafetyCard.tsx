'use client';

import React, { useState } from 'react';
import { RiskLevel } from '@/lib/ai/types';
import { Volume2, VolumeX, Share2, Copy, Check } from 'lucide-react';

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
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const advisoryClass =
    riskLevel === 'LOW'
      ? 'advisory advisory-safe'
      : riskLevel === 'MEDIUM'
      ? 'advisory advisory-warn'
      : 'advisory';

  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  };

  const handleSpeak = () => {
    if (speaking) {
      stopPlayback();
      return;
    }

    // Determine target spoken text prioritizing natural Hindi vernacular warning
    const textToSpeak = hindiWarning ? hindiWarning : `${recommendedAction ? recommendedAction + '. ' : ''}${englishWarning}`;
    const lang = hindiWarning ? 'hi' : 'en';

    setSpeaking(true);

    // 1. Primary: High-fidelity streaming TTS via /api/tts (works reliably on Linux, Android, iOS, Windows)
    try {
      const audioUrl = `/api/tts?text=${encodeURIComponent(textToSpeak)}&lang=${lang}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setSpeaking(false);
        audioRef.current = null;
      };

      audio.onerror = () => {
        console.warn('[TTS] HTML5 audio streaming failed, attempting local SpeechSynthesis fallback...');
        fallbackLocalSpeech();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[TTS] Autoplay or playback rejected:', err);
          fallbackLocalSpeech();
        });
      }
    } catch {
      fallbackLocalSpeech();
    }
  };

  const fallbackLocalSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSpeaking(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const text = hindiWarning || englishWarning;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = hindiWarning ? 'hi-IN' : 'en-US';
      utterance.rate = 0.95;

      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch {
      setSpeaking(false);
    }
  };

  const handleShareWhatsApp = () => {
    const textToShare = `⚠️ *UPI-SHIELD VERDICT: ${riskLevel} RISK*\n\n${englishWarning}\n\n*हिंदी:*\n${hindiWarning}\n\n*Recommended:* ${recommendedAction}\n\n— Verified via UPI-Shield (Helpline 1930)`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
    window.open(url, '_blank');
  };

  const handleCopy = async () => {
    const text = `UPI-SHIELD ADVISORY (${riskLevel} RISK)\n\nEnglish:\n${englishWarning}\n\nहिंदी:\n${hindiWarning}\n\nAction: ${recommendedAction}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // Combine recommendedAction seamlessly with the warning for maximum urgency/clarity
  const cleanEnglish = englishWarning.startsWith(recommendedAction)
    ? englishWarning
    : `${recommendedAction ? recommendedAction + ' ' : ''}${englishWarning}`;

  return (
    <section className="space-y-3">
      <h3 className="text-[15px] font-semibold text-[var(--ink)] m-0">
        What to do now
      </h3>

      <div className={advisoryClass}>
        <div className="line">
          {cleanEnglish}
        </div>

        {hindiWarning && (
          <div className="line hindi devanagari">
            {hindiWarning}
          </div>
        )}

        <div className="actions">
          <button type="button" onClick={handleSpeak}>
            {speaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[var(--stamp)]" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
                <span>Listen</span>
              </>
            )}
          </button>

          <button type="button" onClick={handleShareWhatsApp}>
            <Share2 className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
            <span>Share on WhatsApp</span>
          </button>

          <button type="button" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[var(--safe)]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
                <span>Copy text</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
