import React from 'react';

type TranslatorPanelProps = {
  mode: 'source' | 'target';
  text: string;
  lang: string;
  onTextChange?: (text: string) => void;
  onLangChange: (lang: string) => void;
  isLoading: boolean;
  languages: Array<{ code: string; name: string }>;
};

export default function TranslatorPanel({
  mode,
  text,
  lang,
  onTextChange,
  onLangChange,
  isLoading,
  languages,
}: TranslatorPanelProps) {
  return (
    <div className={`translator-panel translator-panel--${mode}`}>
      <div className="panel-header">
        <select
          value={lang}
          onChange={(e) => onLangChange((e.target as HTMLSelectElement).value)}
          className="language-selector"
        >
          {mode === 'source' && <option value="">Auto-detect</option>}
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </select>
      </div>
      <div className="panel-content">
        <textarea
          value={text}
          onChange={onTextChange ? (e) => onTextChange((e.target as HTMLTextAreaElement).value) : undefined}
          readOnly={mode === 'target'}
          placeholder={mode === 'source' ? 'Enter text to translate...' : 'Translation will appear here...'}
          className="translator-textarea"
        />
        {isLoading && mode === 'target' && (
          <div className="loading-indicator">Translating...</div>
        )}
      </div>
    </div>
  );
}
