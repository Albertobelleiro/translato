import { useEffect, useRef, useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface TranslateResult {
  translatedText: string;
  detectedLang: string;
  isLoading: boolean;
  error: string | null;
  forceTranslate: () => void;
}

export function useTranslate(
  sourceText: string,
  sourceLang: string,
  targetLang: string,
): TranslateResult {
  const [translatedText, setTranslatedText] = useState("");
  const [detectedLang, setDetectedLang] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const translateAction = useAction(api.translator.translate);

  const doTranslate = (text: string) => {
    if (!text.trim() || !targetLang) {
      setTranslatedText("");
      setDetectedLang("");
      setError(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    translateAction({
      text,
      sourceLang: sourceLang || undefined,
      targetLang,
    })
      .then((data) => {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return;
        setTranslatedText(data.translatedText);
        setDetectedLang(data.detectedSourceLang);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return;
        const message = err instanceof Error ? err.message : "Translation failed";
        setError(message);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!sourceText.trim()) {
      abortRef.current?.abort();
      abortRef.current = null;
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
