import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";

type TranslationDoc = Doc<"translations">;

function short(text: string) {
  return text.length > 56 ? `${text.slice(0, 56)}...` : text;
}

function ago(timestamp: number) {
  const mins = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function History({ onSelect }: { onSelect: (item: TranslationDoc) => void }) {
  const items = useQuery(api.translations.list, { limit: 20 });
  if (!items || items.length === 0) return null;

  return (
    <section style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-3)" }}>
      <div style={{ color: "var(--color-text-secondary)", fontSize: 12, marginBottom: "var(--spacing-2)" }}>Recent translations</div>
      <div style={{ display: "grid", gap: "var(--spacing-2)", maxHeight: 180, overflowY: "auto" }}>
        {items.map((item) => (
          <button
            key={item._id}
            type="button"
            onClick={() => onSelect(item)}
            style={{ textAlign: "left", border: "1px solid var(--color-border-stroke)", background: "var(--color-bg-input)", color: "var(--color-text-primary)", borderRadius: "var(--radius-md)", padding: "var(--spacing-2)", cursor: "pointer" }}
          >
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{item.sourceLang}{" -> "}{item.targetLang} • {ago(item.createdAt)}</div>
            <div>{short(item.sourceText)}</div>
            <div style={{ color: "var(--color-text-secondary)" }}>{short(item.targetText)}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
