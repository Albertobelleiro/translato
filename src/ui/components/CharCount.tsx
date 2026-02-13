interface CharCountProps {
  count: number;
  max?: number;
}

export function CharCount({ count, max = 128000 }: CharCountProps) {
  const isWarning = count > max * 0.9;
  return (
    <span className={`char-count${isWarning ? " char-count-warning" : ""}`}>
      {count.toLocaleString()} / {max.toLocaleString()}
    </span>
  );
}
