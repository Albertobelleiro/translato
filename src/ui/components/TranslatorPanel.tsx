import { Cancel01Icon, Mic01Icon, VolumeHighIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { MAX_TEXT_BYTES } from "../../shared/constants.ts";

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

const textEncoder = new TextEncoder();

export function TranslatorPanel({ mode, text, onTextChange, isLoading, error, onClear }: TranslatorPanelProps) {
  const isSource = mode === "source";
  const sourceByteCount = isSource ? textEncoder.encode(text).length : 0;

  return (
    <div className={`panel${!isSource && isLoading ? " panel-loading" : ""}`}>
      <TextArea
        value={text}
        onChange={isSource ? onTextChange : undefined}
        readOnly={!isSource}
        placeholder={isSource ? "Enter your text here" : "Translated text"}
      />
      {error && !isSource && <div className="error-text">{error}</div>}
      <div className="panel-footer">
        {isSource ? (
          <>
            <div className="panel-footer-tools">
              <button className="icon-btn" disabled aria-label="Microphone" title="Coming soon">
                <HugeiconsIcon icon={Mic01Icon} size={16} />
              </button>
              <button className="icon-btn" disabled aria-label="Listen" title="Coming soon">
                <HugeiconsIcon icon={VolumeHighIcon} size={16} />
              </button>
            </div>
            <div className="panel-footer-meta">
              <CharCount count={sourceByteCount} max={MAX_TEXT_BYTES} />
              {text.length > 0 && (
                <button className="icon-btn" onClick={onClear} aria-label="Clear text">
                  <HugeiconsIcon icon={Cancel01Icon} size={16} />
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="panel-footer-tools">
              <button className="icon-btn" disabled aria-label="Listen" title="Coming soon">
                <HugeiconsIcon icon={VolumeHighIcon} size={16} />
              </button>
            </div>
            <div className="panel-footer-meta">
              {text.length > 0 && <CopyButton text={text} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
