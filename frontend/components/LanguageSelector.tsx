import { useState, useRef, useEffect } from "react";
import type { Language } from "../constants/languages.ts";

interface LanguageSelectorProps {
  value: string;
  onChange: (code: string) => void;
  languages: Language[];
  showAutoDetect?: boolean;
}

export function LanguageSelector({ value, onChange, languages, showAutoDetect }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // Focus search input when opened
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const current = languages.find((l) => l.code === value);
  const label = value === "" && showAutoDetect ? "🌐 Auto-detect" : current ? `${current.flag} ${current.name}` : value;

  const filtered = languages.filter(
    (l) => l.name.toLowerCase().includes(search.toLowerCase()) || l.code.toLowerCase().includes(search.toLowerCase()),
  );

  const select = (code: string) => {
    onChange(code);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="lang-selector" ref={containerRef}>
      <button className="lang-trigger" onClick={() => setOpen(!open)}>
        <span>{label}</span>
        <span className="lang-trigger-chevron">▾</span>
      </button>
      {open && (
        <div className="lang-dropdown">
          <input
            ref={searchRef}
            className="lang-search"
            type="text"
            placeholder="Search languages…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="lang-list">
            {showAutoDetect && (
              <button
                className={`lang-option${value === "" ? " lang-option-active" : ""}`}
                onClick={() => select("")}
              >
                🌐 Auto-detect
              </button>
            )}
            {filtered.map((l) => (
              <button
                key={l.code}
                className={`lang-option${l.code === value ? " lang-option-active" : ""}`}
                onClick={() => select(l.code)}
              >
                {l.flag} {l.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
