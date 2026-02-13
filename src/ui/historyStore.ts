export interface TranslationHistoryItem {
  id: string;
  sourceText: string;
  targetText: string;
  sourceLang: string;
  targetLang: string;
  detectedSourceLang?: string;
  createdAt: number;
}

export interface TranslationSnapshot {
  sourceText: string;
  targetText: string;
  sourceLang: string;
  targetLang: string;
  detectedSourceLang?: string;
}

const HISTORY_STORAGE_KEY = "translato.translationHistory.v1";
const HISTORY_LIMIT = 200;

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function makeId(now: number): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${now}-${Math.random().toString(36).slice(2, 10)}`;
}

export function loadTranslationHistory(): TranslationHistoryItem[] {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TranslationHistoryItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) =>
      typeof item?.id === "string"
      && typeof item?.sourceText === "string"
      && typeof item?.targetText === "string"
      && typeof item?.sourceLang === "string"
      && typeof item?.targetLang === "string"
      && typeof item?.createdAt === "number"
    );
  } catch {
    return [];
  }
}

export function persistTranslationHistory(items: TranslationHistoryItem[]): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function appendTranslationSnapshot(
  history: TranslationHistoryItem[],
  snapshot: TranslationSnapshot,
  now: number = Date.now(),
): TranslationHistoryItem[] {
  const sourceText = snapshot.sourceText.trim();
  const targetText = snapshot.targetText.trim();
  if (!sourceText || !targetText) return history;

  const previous = history[0];
  if (
    previous
    && previous.sourceText === sourceText
    && previous.targetText === targetText
    && previous.sourceLang === snapshot.sourceLang
    && previous.targetLang === snapshot.targetLang
    && previous.detectedSourceLang === snapshot.detectedSourceLang
  ) {
    return history;
  }

  const nextEntry: TranslationHistoryItem = {
    id: makeId(now),
    sourceText,
    targetText,
    sourceLang: snapshot.sourceLang,
    targetLang: snapshot.targetLang,
    detectedSourceLang: snapshot.detectedSourceLang,
    createdAt: now,
  };

  return [nextEntry, ...history].slice(0, HISTORY_LIMIT);
}
