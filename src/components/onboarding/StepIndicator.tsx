type Props = {
  current: number;
  total: number;
};

// "Step N of M" centered text used in the top bar.
export function StepIndicator({ current, total }: Props) {
  return (
    <span className="text-sm text-muted-foreground" aria-live="polite">
      Step {current} of {total}
    </span>
  );
}
