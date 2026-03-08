'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Mic, MicOff } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  SpeechRecognition types (not yet in lib.dom for all browsers)     */
/* ------------------------------------------------------------------ */
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */
const MAX_CHARS = 500;

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */
interface FreeTextProps {
  value: string;
  onChange: (value: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export default function FreeText({ value, onChange }: FreeTextProps) {
  const t = useTranslations('diagnosis.q16b');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  /* --- detect SpeechRecognition support --- */
  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setSpeechSupported(!!SR);
  }, []);

  /* --- auto-resize textarea --- */
  const autoResize = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  /* --- handle text change --- */
  const handleChange = (text: string) => {
    if (text.length <= MAX_CHARS) {
      onChange(text);
    }
  };

  /* --- character counter colour --- */
  const charCount = (value ?? '').length;
  const counterClass =
    charCount > 480
      ? 'text-red-400'
      : charCount >= 400
        ? 'text-ofira-peach'
        : 'text-ofira-violet';

  /* --- speech recognition --- */
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';

    const baseValue = value ?? '';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      const combined = baseValue + (baseValue ? ' ' : '') + transcript;
      handleChange(combined.slice(0, MAX_CHARS));
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  /* --- animation variants --- */
  const bubbleVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.5, ease: 'easeOut' as const },
    }),
  };

  return (
    <div className="w-full max-w-lg">
      {/* Title */}
      <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
        {t('title')}
      </h2>

      {/* System bubble */}
      <motion.div
        className="flex justify-start"
        custom={0}
        variants={bubbleVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-ofira-card-border bg-ofira-card p-4">
          <p className="text-sm leading-relaxed text-ofira-text-secondary">
            {t('systemMessage')}
          </p>
        </div>
      </motion.div>

      {/* User bubble */}
      <motion.div
        className="mt-4 flex justify-end"
        custom={1}
        variants={bubbleVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative w-full max-w-[85%]">
          <div className="rounded-2xl rounded-tr-sm bg-ofira-surface2 p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={value ?? ''}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={t('placeholder')}
                rows={1}
                maxLength={MAX_CHARS}
                className="w-full resize-none bg-transparent text-sm text-ofira-text placeholder-ofira-text-secondary outline-none transition-colors focus:border-ofira-violet"
                style={{ maxHeight: 200 }}
              />
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                    isRecording
                      ? 'animate-pulse bg-red-500 text-white'
                      : 'bg-ofira-surface1 text-ofira-text-secondary hover:text-ofira-violet'
                  }`}
                  aria-label={isRecording ? 'Detener grabacion' : 'Grabar voz'}
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Character counter */}
          <p className={`mt-1 text-right text-xs ${counterClass}`}>
            {charCount}/{MAX_CHARS}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
