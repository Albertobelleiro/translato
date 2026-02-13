import { useEffect, useRef } from "react";

interface TextAreaProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

export function TextArea({ value, onChange, readOnly, placeholder }: TextAreaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      className="textarea"
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      readOnly={readOnly}
      placeholder={placeholder}
      spellCheck={!readOnly}
    />
  );
}
