type Props = {
  value: number; // 0..1
  className?: string;
};

// Thin 4px progress bar with a smoothly-animated filled portion.
export function ProgressBar({ value, className = "" }: Props) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div
      className={`h-1 bg-muted rounded-full overflow-hidden ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
    >
      <div
        className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
        style={{ width: `${clamped * 100}%` }}
      />
    </div>
  );
}
