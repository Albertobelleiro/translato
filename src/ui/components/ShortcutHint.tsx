import { useEffect, useState } from "react";

interface ShortcutHintProps {
  message: string | null;
  hintKey?: number | string;
}

export function ShortcutHint({ message, hintKey }: ShortcutHintProps) {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!message) return;
    setText(message);
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 1400);
    return () => clearTimeout(timer);
  }, [message, hintKey]);

  if (!visible) return null;

  return (
    <div className="shortcut-hint" role="status" aria-live="polite">
      {text}
    </div>
  );
}
