import { CheckmarkCircle02Icon, Copy01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      // Trigger bounce animation
      if (btnRef.current) {
        btnRef.current.classList.remove("copy-btn-bounce");
        void btnRef.current.offsetWidth; // force reflow
        btnRef.current.classList.add("copy-btn-bounce");
      }

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy text to clipboard", error);
    }
  };

  return (
    <button ref={btnRef} className="icon-btn" onClick={handleCopy} aria-label="Copy translation">
      {copied ? (
        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} color="var(--color-accent-500)" />
      ) : (
        <HugeiconsIcon icon={Copy01Icon} size={18} />
      )}
    </button>
  );
}
