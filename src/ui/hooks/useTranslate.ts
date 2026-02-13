import { useEffect, useRef, useState } from "react";

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
    setIsLoading(true);
    setError(null);

    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        source_lang: sourceLang || undefined,
        target_lang: targetLang,
      }),
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) return res.json().then((e: { error?: string }) => { throw new Error(e.error || `Error ${res.status}`); });
        return res.json() as Promise<{ translatedText: string; detectedSourceLang: string }>;
      })
      .then((data) => {
        setTranslatedText(data.translatedText);
        setDetectedLang(data.detectedSourceLang);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!sourceText.trim()) {
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
