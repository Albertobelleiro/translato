import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDataTransferHorizontalIcon } from "@hugeicons/core-free-icons";

interface SwapButtonProps {
  onSwap: () => void;
  disabled?: boolean;
}

export function SwapButton({ onSwap, disabled }: SwapButtonProps) {
  const [rotated, setRotated] = useState(false);

  const handleClick = () => {
    setRotated((r) => !r);
    onSwap();
  };

  return (
    <button
      className={`swap-btn${rotated ? " swap-btn-rotated" : ""}`}
      onClick={handleClick}
      disabled={disabled}
      aria-label="Swap languages"
    >
      <HugeiconsIcon icon={ArrowDataTransferHorizontalIcon} size={18} />
    </button>
  );
}
