import { UserButton } from "@clerk/clerk-react";
import { Globe02Icon, LanguageSquareIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useEffect, useReducer, useRef } from "react";

import { api } from "../../convex/_generated/api";
import { languages } from "../translator/languages.ts";
import { History } from "./components/History.tsx";
import { LanguageSelector } from "./components/LanguageSelector.tsx";
import { SwapButton } from "./components/SwapButton.tsx";
import { TranslatorPanel } from "./components/TranslatorPanel.tsx";
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

function toBilateralTarget(code: string): string {
  return code === "ES" ? "ES" : DEFAULT_TARGET_LANG;
}

function targetFromDetectedLanguage(code: string): string | null {
  const normalized = code.toUpperCase();
  if (normalized === "ES" || normalized.startsWith("ES-")) return "EN-US";
  if (normalized === "EN" || normalized.startsWith("EN-")) return "ES";
  return null;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_SOURCE_TEXT": return { ...state, sourceText: action.payload };
    case "SET_TARGET_TEXT": return { ...state, targetText: action.payload };
    case "SET_SOURCE_LANG": return { ...state, sourceLang: "" };
    case "SET_TARGET_LANG": return { ...state, targetLang: action.payload };
    case "SET_LOADING": return { ...state, isLoading: action.payload };
    case "SET_ERROR": return { ...state, error: action.payload };
    case "SWAP_LANGS": return state;
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
  const didHydratePreferences = useRef(false);
  const { isAuthenticated } = useConvexAuth();
  const preferences = useQuery(api.preferences.get, isAuthenticated ? {} : "skip");
  const savePreferences = useMutation(api.preferences.save);
  const { translatedText, detectedLang, isLoading, error, forceTranslate } = useTranslate(
    state.sourceText,
    state.sourceLang,
    state.targetLang,
  );

  useEffect(() => { dispatch({ type: "SET_TARGET_TEXT", payload: translatedText }); }, [translatedText]);
  useEffect(() => { dispatch({ type: "SET_LOADING", payload: isLoading }); }, [isLoading]);
  useEffect(() => { dispatch({ type: "SET_ERROR", payload: error }); }, [error]);

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
    if (!state.sourceText.trim()) return;
    const detectedTarget = targetFromDetectedLanguage(detectedLang);
    if (!detectedTarget || detectedTarget === state.targetLang) return;
    dispatch({ type: "SET_TARGET_LANG", payload: detectedTarget });
  }, [detectedLang, state.sourceText, state.targetLang]);

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

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <HugeiconsIcon icon={LanguageSquareIcon} size={22} color="var(--color-accent-500)" />
          <span className="app-title">Translato</span>
        </div>
        <div className="app-header-actions">
          <span className="app-subtitle">Powered by DeepL</span>
          <UserButton
            appearance={{
              elements: {
                avatarBox: {
                  width: 28,
                  height: 28,
                },
              },
            }}
          />
        </div>
      </header>

      <main className="translator">
        <div className="lang-bar">
          <div className="lang-bar-side">
            <button className="lang-trigger" type="button" disabled>
              <HugeiconsIcon icon={Globe02Icon} size={18} />
              <span className="lang-trigger-label">Detect language</span>
            </button>
          </div>
          <SwapButton onSwap={() => dispatch({ type: "SWAP_LANGS" })} disabled />
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

        {isAuthenticated && (
          <History
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
        )}
      </main>

      <footer className="app-footer">
        <kbd className="kbd">⌘</kbd><kbd className="kbd">↵</kbd>
        <span className="app-footer-text">to translate</span>
      </footer>
    </div>
  );
}
