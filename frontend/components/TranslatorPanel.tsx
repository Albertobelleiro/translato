import type { Language } from "../constants/languages.ts";
import { TextArea } from "./TextArea.tsx";
import { CharCount } from "./CharCount.tsx";
import { CopyButton } from "./CopyButton.tsx";

interface TranslatorPanelProps {
  mode: "source" | "target";
  text: string;
  onTextChange?: (text: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onClear?: () => void;
}

export function TranslatorPanel({ mode, text, onTextChange, isLoading, error, onClear }: TranslatorPanelProps) {
  const isSource = mode === "source";

  return (
    <div className={`panel${isLoading && !isSource ? " panel-loading" : ""}`}>
      <TextArea
        value={text}
        onChange={isSource ? onTextChange : undefined}
        readOnly={!isSource}
        placeholder={isSource ? "Type to translate…" : "Translation"}
      />
      {error && !isSource && <div className="error-text">{error}</div>}
      <div className="panel-footer">
        {isSource ? (
          <>
            <CharCount count={text.length} />
            {text.length > 0 && (
              <button className="clear-btn" onClick={onClear} aria-label="Clear text">✕</button>
            )}
          </>
        ) : (
          <>
            <span />
            {text.length > 0 && <CopyButton text={text} />}
          </>
        )}
      </div>
    </div>
  );
}
