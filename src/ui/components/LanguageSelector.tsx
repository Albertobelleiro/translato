import { useState, useRef, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, Search01Icon, Globe02Icon } from "@hugeicons/core-free-icons";
import type { Language } from "../../translator/languages.ts";

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

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); setSearch(""); }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const current = languages.find((l) => l.code === value);
  const isAutoDetect = value === "" && showAutoDetect;

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
        {isAutoDetect ? (
          <HugeiconsIcon icon={Globe02Icon} size={18} />
        ) : current ? (
          <current.Flag size={20} aria-hidden />
        ) : null}
        <span className="lang-trigger-label">{isAutoDetect ? "Detect language" : current?.name ?? value}</span>
        <HugeiconsIcon icon={ArrowDown01Icon} size={14} color="var(--color-icon)" />
      </button>

      {open && (
        <div className="lang-dropdown">
          <div className="lang-search-wrapper">
            <HugeiconsIcon icon={Search01Icon} size={15} color="var(--color-text-muted)" />
            <input
              ref={searchRef}
              className="lang-search"
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="lang-list">
            {showAutoDetect && (
              <button className={`lang-option${value === "" ? " lang-option-active" : ""}`} onClick={() => select("")}>
                <HugeiconsIcon icon={Globe02Icon} size={18} />
                <span>Detect language</span>
              </button>
            )}
            {filtered.map((l) => (
              <button
                key={l.code}
                className={`lang-option${l.code === value ? " lang-option-active" : ""}`}
                onClick={() => select(l.code)}
              >
                <l.Flag size={20} aria-hidden />
                <span>{l.name}</span>
                <span className="lang-option-code">{l.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
