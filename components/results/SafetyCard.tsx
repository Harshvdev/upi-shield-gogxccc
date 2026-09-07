'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  const [playingTrack, setPlayingTrack] = useState<'en' | 'hi' | null>(null);
  const [copied, setCopied] = useState(false);

  const advisoryClass =
    riskLevel === 'LOW'
      ? 'advisory advisory-safe'
      : riskLevel === 'MEDIUM'
      ? 'advisory advisory-warn'
      : 'advisory';

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelledRef = useRef(false);

  const stopPlayback = () => {
    cancelledRef.current = true;
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
    setPlayingTrack(null);
  };

  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  const fallbackSpeechSynthesis = (
    text: string,
    lang: 'en' | 'hi',
    onFinish: () => void
  ) => {
    if (cancelledRef.current || !text) {
      onFinish();
      return;
    }
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      onFinish();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.95;

      utterance.onend = () => {
        if (!cancelledRef.current) onFinish();
      };
      utterance.onerror = () => {
        if (!cancelledRef.current) onFinish();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      onFinish();
    }
  };

  const playAudioTrack = (
    text: string,
    lang: 'en' | 'hi',
    onFinish: () => void
  ) => {
    if (cancelledRef.current || !text) {
      onFinish();
      return;
    }

    setPlayingTrack(lang);

    // Guard against multiple callback invocations (e.g. onerror + playPromise rejection)
    let isHandled = false;
    const finishOnce = () => {
      if (isHandled) return;
      isHandled = true;
      if (!cancelledRef.current) {
        onFinish();
      }
    };

    // Clean up any previously playing audio before starting new track
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }

    try {
      const audioUrl = `/api/tts?text=${encodeURIComponent(text)}&lang=${lang}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        finishOnce();
      };

      audio.onerror = () => {
        console.warn(`[TTS] ${lang} audio stream failed, attempting local speech fallback...`);
        fallbackSpeechSynthesis(text, lang, finishOnce);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn(`[TTS] ${lang} playback rejected, attempting local speech fallback:`, err);
          fallbackSpeechSynthesis(text, lang, finishOnce);
        });
      }
    } catch (err) {
      console.warn(`[TTS] ${lang} audio error:`, err);
      fallbackSpeechSynthesis(text, lang, finishOnce);
    }
  };

  // Combine recommendedAction seamlessly with the warning for maximum urgency/clarity
  const cleanEnglish = englishWarning.startsWith(recommendedAction)
    ? englishWarning
    : `${recommendedAction ? recommendedAction + ' ' : ''}${englishWarning}`;

  const handleSpeak = (target?: 'all' | 'en' | 'hi') => {
    if (speaking) {
      stopPlayback();
      return;
    }

    const enText = cleanEnglish.trim();
    const hiText = (hindiWarning || '').trim();

    if (!enText && !hiText) return;

    cancelledRef.current = false;
    setSpeaking(true);

    if (target === 'en' && enText) {
      playAudioTrack(enText, 'en', () => {
        stopPlayback();
      });
      return;
    }

    if (target === 'hi' && hiText) {
      playAudioTrack(hiText, 'hi', () => {
        stopPlayback();
      });
      return;
    }

    // Default: Sequential bilingual readout: First English -> Then Hindi
    if (enText) {
      playAudioTrack(enText, 'en', () => {
        if (cancelledRef.current) return;
        if (hiText) {
          playAudioTrack(hiText, 'hi', () => {
            stopPlayback();
          });
        } else {
          stopPlayback();
        }
      });
    } else if (hiText) {
      playAudioTrack(hiText, 'hi', () => {
        stopPlayback();
      });
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

  return (
    <section className="space-y-3">
      <h3 className="text-[15px] font-semibold text-[var(--ink)] m-0">
        What to do now
      </h3>

      <div className={advisoryClass}>
        <div className="line flex items-start justify-between gap-3">
          <div className="flex-1">{cleanEnglish}</div>
          <button
            type="button"
            onClick={() =>
              speaking && playingTrack === 'en' ? stopPlayback() : handleSpeak('en')
            }
            className="shrink-0 p-1 rounded hover:bg-black/5 text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors cursor-pointer border-0 bg-transparent"
            title={speaking && playingTrack === 'en' ? 'Stop English audio' : 'Listen in English'}
            aria-label="Listen in English"
          >
            {speaking && playingTrack === 'en' ? (
              <VolumeX className="w-4 h-4 text-[var(--stamp)] animate-pulse" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {hindiWarning && (
          <div className="line hindi devanagari flex items-start justify-between gap-3">
            <div className="flex-1">{hindiWarning}</div>
            <button
              type="button"
              onClick={() =>
                speaking && playingTrack === 'hi' ? stopPlayback() : handleSpeak('hi')
              }
              className="shrink-0 p-1 rounded hover:bg-black/5 text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors cursor-pointer border-0 bg-transparent"
              title={speaking && playingTrack === 'hi' ? 'हिंदी ऑडियो रोकें' : 'हिंदी में सुनें'}
              aria-label="हिंदी में सुनें"
            >
              {speaking && playingTrack === 'hi' ? (
                <VolumeX className="w-4 h-4 text-[var(--stamp)] animate-pulse" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>
        )}

        <div className="actions">
          <button
            type="button"
            onClick={() => (speaking ? stopPlayback() : handleSpeak('all'))}
            className={speaking ? '!border-[var(--stamp)] !text-[var(--stamp)]' : ''}
            title={speaking ? 'Stop audio readout' : 'Listen to advisory (English & Hindi)'}
          >
            {speaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[var(--stamp)] animate-pulse" />
                <span>
                  Stop {playingTrack === 'en' ? '(English)' : playingTrack === 'hi' ? '(हिंदी)' : ''}
                </span>
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

