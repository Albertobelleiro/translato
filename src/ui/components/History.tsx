import { useState } from "react";
import type { TranslationHistoryItem } from "../historyStore.ts";

const LANG_NAMES: Record<string, string> = {
  "EN-US": "English",
  "EN": "English",
  "ES": "Spanish",
  auto: "Auto",
};

function langName(code: string): string {
  return LANG_NAMES[code.toUpperCase()] ?? code;
}

function short(text: string, max = 48) {
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function ago(timestamp: number) {
  const mins = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function HistoryTabs({
  items = [],
  onSelect,
}: {
  items?: TranslationHistoryItem[];
  onSelect: (item: TranslationHistoryItem) => void;
}) {
  const [activeTab, setActiveTab] = useState<"history" | "dictionary">("history");

  if (items.length === 0 && activeTab === "history") return null;

  return (
    <section className="history-section">
      <div className="history-tabs">
        <button
          type="button"
          className={`history-tab${activeTab === "history" ? " history-tab-active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
        <button
          type="button"
          className="history-tab"
          disabled
          title="Coming soon"
        >
          Dictionary
        </button>
      </div>

      {activeTab === "history" && (
        items.length === 0 ? (
          <div className="history-empty">No translations yet</div>
        ) : (
          <div className="history-list">
            {items.map((item) => {
              const srcLang = item.sourceLang === "auto"
                ? (item.detectedSourceLang ?? "auto")
                : item.sourceLang;
              return (
                <button
                  key={item.id}
                  type="button"
                  className="history-item"
                  onClick={() => onSelect(item)}
                >
                  <span className="history-badge">
                    {langName(srcLang)} → {langName(item.targetLang)}
                  </span>
                  <span />
                  <span className="history-time">{ago(item.createdAt)}</span>
                  <div className="history-texts">
                    <span className="history-source">{short(item.sourceText)}</span>
                    <span className="history-arrow">→</span>
                    <span className="history-target">{short(item.targetText)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )
      )}
    </section>
  );
}
