import { useAction } from "convex/react";
import { useEffect, useRef, useState } from "react";

import { api } from "../../../convex/_generated/api";

type CachedTranslation = {
  translatedText: string;
  detectedLang: string;
  cachedAt: number;
};

const translationCache = new Map<string, CachedTranslation>();
const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_LIMIT = 300;

function getCacheKey(text: string, sourceLang: string, targetLang: string): string {
  return `${text}\u0000${sourceLang || "auto"}\u0000${targetLang}`;
}

function getCachedTranslation(cacheKey: string): CachedTranslation | null {
  const cached = translationCache.get(cacheKey);
  if (!cached) return null;
  if (Date.now() - cached.cachedAt > CACHE_TTL_MS) {
    translationCache.delete(cacheKey);
    return null;
  }
  return cached;
}

function setCachedTranslation(cacheKey: string, translatedText: string, detectedLang: string): void {
  if (translationCache.size >= CACHE_LIMIT) {
    const oldestKey = translationCache.keys().next().value;
    if (oldestKey) translationCache.delete(oldestKey);
  }

  translationCache.set(cacheKey, {
    translatedText,
    detectedLang,
    cachedAt: Date.now(),
  });
}

interface TranslateResult {
  translatedText: string;
  detectedLang: string;
  isLoading: boolean;
  error: string | null;
  forceTranslate: () => void;
}

type PendingTranslation = {
  requestId: number;
  text: string;
  sourceLang?: string;
  targetLang: string;
  cacheKey: string;
};

export function useTranslate(
  sourceText: string,
  sourceLang: string,
  targetLang: string,
): TranslateResult {
  const [translatedText, setTranslatedText] = useState("");
  const [detectedLang, setDetectedLang] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const inFlightRef = useRef(false);
  const pendingRef = useRef<PendingTranslation | null>(null);
  const translateAction = useAction(api.translator.translate);

  const runPending = () => {
    const request = pendingRef.current;
    if (!request || inFlightRef.current) return;

    pendingRef.current = null;
    inFlightRef.current = true;

    translateAction({
      text: request.text,
      sourceLang: request.sourceLang,
      targetLang: request.targetLang,
    })
      .then((data) => {
        if (request.requestId !== requestIdRef.current) return;
        setCachedTranslation(request.cacheKey, data.translatedText, data.detectedSourceLang);
        setTranslatedText(data.translatedText);
        setDetectedLang(data.detectedSourceLang);
        setError(null);
      })
      .catch((err: unknown) => {
        if (request.requestId !== requestIdRef.current) return;
        const message = err instanceof Error ? err.message : "Translation failed";
        setError(message);
      })
      .finally(() => {
        inFlightRef.current = false;
        if (pendingRef.current) {
          runPending();
          return;
        }
        if (request.requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      });
  };

  const doTranslate = (text: string) => {
    const requestId = ++requestIdRef.current;

    if (!text.trim() || !targetLang) {
      pendingRef.current = null;
      setTranslatedText("");
      setDetectedLang("");
      setIsLoading(false);
      setError(null);
      return;
    }

    const cacheKey = getCacheKey(text, sourceLang, targetLang);
    const cached = getCachedTranslation(cacheKey);
    if (cached) {
      pendingRef.current = null;
      setTranslatedText(cached.translatedText);
      setDetectedLang(cached.detectedLang);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    pendingRef.current = {
      requestId,
      text,
      sourceLang: sourceLang || undefined,
      targetLang,
      cacheKey,
    };

    runPending();
  };

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!sourceText.trim()) {
      requestIdRef.current += 1;
      pendingRef.current = null;
      setTranslatedText("");
      setDetectedLang("");
      setIsLoading(false);
      setError(null);
      return;
    }

    timerRef.current = setTimeout(() => doTranslate(sourceText), 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sourceText, sourceLang, targetLang]);

  const forceTranslate = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    doTranslate(sourceText);
  };

  return { translatedText, detectedLang, isLoading, error, forceTranslate };
}
