import { useRef, useEffect, useState } from "react";

interface TextAreaProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

export function TextArea({ value, onChange, readOnly, placeholder }: TextAreaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [fading, setFading] = useState(false);
  const prevValue = useRef(value);

  // Auto-resize
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  // Fade-in on readOnly text changes
  useEffect(() => {
    if (readOnly && value !== prevValue.current) {
      setFading(true);
      const t = setTimeout(() => setFading(false), 20);
      prevValue.current = value;
      return () => clearTimeout(t);
    }
    prevValue.current = value;
  }, [value, readOnly]);

  return (
    <textarea
      ref={ref}
      className={`textarea${fading ? " textarea-fading" : ""}`}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      readOnly={readOnly}
      placeholder={placeholder}
      spellCheck={!readOnly}
    />
  );
}
