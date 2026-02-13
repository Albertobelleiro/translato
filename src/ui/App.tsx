import * as hugeicons from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import { api } from "../../convex/_generated/api";
import { languages, sourceLangs } from "../translator/languages.ts";
import { Avatar } from "./components/Avatar.tsx";
import { HistoryTabs } from "./components/History.tsx";
import { LanguageSelector } from "./components/LanguageSelector.tsx";
import { ShortcutHint } from "./components/ShortcutHint.tsx";
import { SwapButton } from "./components/SwapButton.tsx";
import { ThemeToggle } from "./components/ThemeToggle.tsx";
import { TranslatorPanel } from "./components/TranslatorPanel.tsx";
import {
  appendTranslationSnapshot,
  loadTranslationHistory,
  persistTranslationHistory,
  type TranslationSnapshot,
} from "./historyStore.ts";
import { useTranslate } from "./hooks/useTranslate.ts";

interface State {
  sourceText: string;
  targetText: string;
  sourceLang: string;
  targetLang: string;
  isLoading: boolean;
  error: string | null;
}

type Action =
  | { type: "SET_SOURCE_TEXT"; payload: string }
  | { type: "SET_TARGET_TEXT"; payload: string }
  | { type: "SET_SOURCE_LANG"; payload: string }
  | { type: "SET_TARGET_LANG"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SWAP_LANGS" }
  | { type: "CLEAR" };

const DEFAULT_TARGET_LANG = "EN-US";
const bilateralTargetLanguages = languages.filter((lang) => lang.code === "EN-US" || lang.code === "ES");
const brandIcon = hugeicons.LanguageSquareIcon ?? hugeicons.Globe02Icon;
const detectedIcon = hugeicons.Globe02Icon;

function toBilateralTarget(code: string): string {
  return code === "ES" ? "ES" : DEFAULT_TARGET_LANG;
}

function targetFromDetectedLanguage(code: string): string | null {
  const normalized = code.toUpperCase();
  if (normalized === "ES" || normalized.startsWith("ES-")) return "EN-US";
  if (normalized === "EN" || normalized.startsWith("EN-")) return "ES";
  return null;
}

function sourceLanguageFromDetected(code: string) {
  const normalized = code.toUpperCase();
  if (!normalized) return null;
  if (normalized === "EN" || normalized.startsWith("EN-")) {
    return sourceLangs.find((lang) => lang.code === "EN") ?? null;
  }
  if (normalized === "ES" || normalized.startsWith("ES-")) {
    return sourceLangs.find((lang) => lang.code === "ES") ?? null;
  }
  return sourceLangs.find((lang) => lang.code === normalized) ?? null;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_SOURCE_TEXT": return { ...state, sourceText: action.payload };
    case "SET_TARGET_TEXT": return { ...state, targetText: action.payload };
    case "SET_SOURCE_LANG": return { ...state, sourceLang: "" };
    case "SET_TARGET_LANG": return { ...state, targetLang: action.payload };
    case "SET_LOADING": return { ...state, isLoading: action.payload };
    case "SET_ERROR": return { ...state, error: action.payload };
    case "SWAP_LANGS": {
      const newTarget = state.targetLang === "ES" ? "EN-US" : "ES";
      if (!state.targetText.trim()) {
        return {
          ...state,
          sourceLang: "",
          targetLang: newTarget,
          targetText: "",
        };
      }
      return {
        ...state,
        sourceText: state.targetText,
        targetText: state.sourceText,
        sourceLang: "",
        targetLang: newTarget,
      };
    }
    case "CLEAR": return { ...state, sourceText: "", targetText: "", error: null };
  }
}

const initialState: State = {
  sourceText: "",
  targetText: "",
  sourceLang: "",
  targetLang: DEFAULT_TARGET_LANG,
  isLoading: false,
  error: null,
};

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [historyItems, setHistoryItems] = useState(loadTranslationHistory);
  const [shortcutHint, setShortcutHint] = useState<string | null>(null);
  const [shortcutHintKey, setShortcutHintKey] = useState(0);
  const didHydratePreferences = useRef(false);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestSnapshotRef = useRef<TranslationSnapshot | null>(null);
  const { isAuthenticated } = useConvexAuth();
  const preferences = useQuery(api.preferences.get, isAuthenticated ? {} : "skip");
  const savePreferences = useMutation(api.preferences.save);
  const { translatedText, detectedLang, isLoading, error, forceTranslate } = useTranslate(
    state.sourceText,
    state.sourceLang,
    state.targetLang,
  );
  const detectedSourceLanguage = sourceLanguageFromDetected(detectedLang);
  const DetectedFlag = detectedSourceLanguage?.Flag;

  useEffect(() => { dispatch({ type: "SET_TARGET_TEXT", payload: translatedText }); }, [translatedText]);
  useEffect(() => { dispatch({ type: "SET_LOADING", payload: isLoading }); }, [isLoading]);
  useEffect(() => { dispatch({ type: "SET_ERROR", payload: error }); }, [error]);

  // Auto-dismiss error after 5s
  useEffect(() => {
    if (!state.error) return;
    const timer = setTimeout(() => dispatch({ type: "SET_ERROR", payload: null }), 5000);
    return () => clearTimeout(timer);
  }, [state.error]);

  useEffect(() => {
    if (!isAuthenticated) {
      didHydratePreferences.current = false;
      return;
    }
    if (preferences === undefined || didHydratePreferences.current) return;
    if (preferences) {
      dispatch({ type: "SET_SOURCE_LANG", payload: "" });
      dispatch({ type: "SET_TARGET_LANG", payload: toBilateralTarget(preferences.targetLang) });
    }
    didHydratePreferences.current = true;
  }, [preferences, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !didHydratePreferences.current) return;
    void savePreferences({
      sourceLang: "auto",
      targetLang: state.targetLang,
    });
  }, [state.targetLang, savePreferences, isAuthenticated]);

  useEffect(() => {
    if (state.sourceLang) return;
    if (!state.sourceText.trim()) return;
    const detectedTarget = targetFromDetectedLanguage(detectedLang);
    if (!detectedTarget || detectedTarget === state.targetLang) return;
    dispatch({ type: "SET_TARGET_LANG", payload: detectedTarget });
  }, [detectedLang, state.sourceLang, state.sourceText, state.targetLang]);

  const showHint = useCallback((msg: string) => {
    setShortcutHint(msg);
    setShortcutHintKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "Enter") {
        e.preventDefault();
        forceTranslate();
        showHint("Translating...");
      }
      if (e.metaKey && e.shiftKey && e.key.toUpperCase() === "C") {
        e.preventDefault();
        if (state.targetText) {
          navigator.clipboard.writeText(state.targetText);
          showHint("Copied to clipboard");
        }
      }
      if (e.metaKey && e.shiftKey && e.key.toUpperCase() === "X") {
        e.preventDefault();
        dispatch({ type: "CLEAR" });
        showHint("Cleared");
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [forceTranslate, showHint, state.targetText]);

  useEffect(() => {
    if (!state.sourceText.trim() || !state.targetText.trim()) {
      latestSnapshotRef.current = null;
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
      return;
    }

    if (state.isLoading || state.error) return;

    latestSnapshotRef.current = {
      sourceText: state.sourceText,
      targetText: state.targetText,
      sourceLang: state.sourceLang || "auto",
      targetLang: state.targetLang,
      detectedSourceLang: detectedLang || undefined,
    };

    if (autosaveTimerRef.current) return;

    autosaveTimerRef.current = setTimeout(() => {
      autosaveTimerRef.current = null;
      const snapshot = latestSnapshotRef.current;
      if (!snapshot) return;

      setHistoryItems((previous) => {
        const next = appendTranslationSnapshot(previous, snapshot);
        if (next !== previous) persistTranslationHistory(next);
        return next;
      });
    }, 10_000);
  }, [
    detectedLang,
    state.error,
    state.isLoading,
    state.sourceLang,
    state.sourceText,
    state.targetLang,
    state.targetText,
  ]);

  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <HugeiconsIcon icon={brandIcon} size={22} color="var(--color-accent-500)" />
          <span className="app-title">Translato</span>
        </div>
        <div className="app-header-actions">
          <span className="app-subtitle">Powered by DeepL</span>
          <ThemeToggle />
          <Avatar />
        </div>
      </header>

      <main className="translator">
        <div className="lang-bar">
          <div className="lang-bar-side">
            <button className="lang-trigger" type="button" disabled>
              {DetectedFlag ? <DetectedFlag size={20} aria-hidden /> : <HugeiconsIcon icon={detectedIcon} size={18} />}
              <span className="lang-trigger-label">
                {detectedSourceLanguage
                  ? `${detectedSourceLanguage.name} (detected)`
                  : detectedLang
                    ? `${detectedLang} (detected)`
                    : "Detect language"}
              </span>
            </button>
          </div>
          <SwapButton onSwap={() => dispatch({ type: "SWAP_LANGS" })} />
          <div className="lang-bar-side">
            <LanguageSelector
              value={state.targetLang}
              onChange={(code) => dispatch({ type: "SET_TARGET_LANG", payload: code })}
              languages={bilateralTargetLanguages}
            />
          </div>
        </div>

        <div className="panels">
          <TranslatorPanel
            mode="source"
            text={state.sourceText}
            onTextChange={(t) => dispatch({ type: "SET_SOURCE_TEXT", payload: t })}
            onClear={() => dispatch({ type: "CLEAR" })}
          />
          <TranslatorPanel
            mode="target"
            text={state.targetText}
            isLoading={state.isLoading}
            error={state.error}
          />
        </div>

        <HistoryTabs
          items={historyItems}
          onSelect={(item) => {
            dispatch({ type: "SET_SOURCE_TEXT", payload: item.sourceText });
            dispatch({ type: "SET_TARGET_TEXT", payload: item.targetText });
            dispatch({ type: "SET_SOURCE_LANG", payload: "" });
            dispatch({
              type: "SET_TARGET_LANG",
              payload: targetFromDetectedLanguage(item.detectedSourceLang ?? "") ?? toBilateralTarget(item.targetLang),
            });
          }}
        />
      </main>

      <footer className="app-footer">
        <span className="app-footer-group">
          <kbd className="kbd">⌘</kbd><kbd className="kbd">↵</kbd>
          <span className="app-footer-text">translate</span>
        </span>
        <span className="app-footer-sep">·</span>
        <span className="app-footer-group">
          <kbd className="kbd">⌘</kbd><kbd className="kbd">⇧</kbd><kbd className="kbd">C</kbd>
          <span className="app-footer-text">copy</span>
        </span>
        <span className="app-footer-sep">·</span>
        <span className="app-footer-group">
          <kbd className="kbd">⌘</kbd><kbd className="kbd">⇧</kbd><kbd className="kbd">X</kbd>
          <span className="app-footer-text">clear</span>
        </span>
      </footer>

      <ShortcutHint message={shortcutHint} hintKey={shortcutHintKey} />
    </div>
  );
}
