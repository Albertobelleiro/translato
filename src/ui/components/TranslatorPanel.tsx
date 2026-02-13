import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { CharCount } from "./CharCount.tsx";
import { CopyButton } from "./CopyButton.tsx";
import { TextArea } from "./TextArea.tsx";

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
    <div className={`panel${!isSource && isLoading ? " panel-loading" : ""}`}>
      <TextArea
        value={text}
        onChange={isSource ? onTextChange : undefined}
        readOnly={!isSource}
        placeholder={isSource ? "Type or paste text…" : "Translation"}
      />
      {error && !isSource && <div className="error-text">{error}</div>}
      <div className="panel-footer">
        {isSource ? (
          <>
            <CharCount count={text.length} />
            {text.length > 0 && (
              <button className="icon-btn" onClick={onClear} aria-label="Clear text">
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
              </button>
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
