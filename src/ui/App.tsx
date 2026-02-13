import { useReducer, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { LanguageSquareIcon } from "@hugeicons/core-free-icons";
import { LanguageSelector } from "./components/LanguageSelector.tsx";
import { SwapButton } from "./components/SwapButton.tsx";
import { TranslatorPanel } from "./components/TranslatorPanel.tsx";
import { useTranslate } from "./hooks/useTranslate.ts";
import { languages, sourceLangs } from "../translator/languages.ts";

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

const sourceLangCodes = new Set(sourceLangs.map((lang) => lang.code));
const targetLangCodes = new Set(languages.map((lang) => lang.code));
const preferredTargetBySource: Record<string, string> = {
  EN: "EN-US",
  PT: "PT-BR",
  ZH: "ZH-HANS",
};

function toSourceLang(code: string): string {
  if (sourceLangCodes.has(code)) return code;
  const base = code.split("-")[0] ?? "";
  return base && sourceLangCodes.has(base) ? base : "";
}

function toTargetLang(code: string): string {
  if (targetLangCodes.has(code)) return code;
  const preferred = preferredTargetBySource[code];
  if (preferred && targetLangCodes.has(preferred)) return preferred;
  return languages[0]?.code ?? "ES";
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_SOURCE_TEXT": return { ...state, sourceText: action.payload };
    case "SET_TARGET_TEXT": return { ...state, targetText: action.payload };
    case "SET_SOURCE_LANG": return { ...state, sourceLang: action.payload };
    case "SET_TARGET_LANG": return { ...state, targetLang: action.payload };
    case "SET_LOADING": return { ...state, isLoading: action.payload };
    case "SET_ERROR": return { ...state, error: action.payload };
    case "SWAP_LANGS": return {
      ...state,
      sourceLang: toSourceLang(state.targetLang),
      targetLang: toTargetLang(state.sourceLang || state.targetLang),
      sourceText: state.targetText,
      targetText: state.sourceText,
    };
    case "CLEAR": return { ...state, sourceText: "", targetText: "", error: null };
  }
}

const initialState: State = {
  sourceText: "",
  targetText: "",
  sourceLang: "",
  targetLang: "ES",
  isLoading: false,
  error: null,
};

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { translatedText, isLoading, error, forceTranslate } = useTranslate(
    state.sourceText,
    state.sourceLang,
    state.targetLang,
  );

  useEffect(() => { dispatch({ type: "SET_TARGET_TEXT", payload: translatedText }); }, [translatedText]);
  useEffect(() => { dispatch({ type: "SET_LOADING", payload: isLoading }); }, [isLoading]);
  useEffect(() => { dispatch({ type: "SET_ERROR", payload: error }); }, [error]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "Enter") {
        e.preventDefault();
        forceTranslate();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [forceTranslate]);

  const canSwap = state.sourceLang !== "";

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <HugeiconsIcon icon={LanguageSquareIcon} size={22} color="var(--color-accent-500)" />
          <span className="app-title">Translato</span>
        </div>
        <span className="app-subtitle">Powered by DeepL</span>
      </header>

      <main className="translator">
        <div className="lang-bar">
          <div className="lang-bar-side">
            <LanguageSelector
              value={state.sourceLang}
              onChange={(code) => dispatch({ type: "SET_SOURCE_LANG", payload: code })}
              languages={sourceLangs}
              showAutoDetect
            />
          </div>
          <SwapButton onSwap={() => dispatch({ type: "SWAP_LANGS" })} disabled={!canSwap} />
          <div className="lang-bar-side">
            <LanguageSelector
              value={state.targetLang}
              onChange={(code) => dispatch({ type: "SET_TARGET_LANG", payload: code })}
              languages={languages}
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
      </main>

      <footer className="app-footer">
        <kbd className="kbd">⌘</kbd><kbd className="kbd">↵</kbd>
        <span className="app-footer-text">to translate</span>
      </footer>
    </div>
  );
}
