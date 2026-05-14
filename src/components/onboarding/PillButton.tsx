type Props = {
  label: string;
  selected: boolean;
  onClick: () => void;
};

// Rounded-full pill for single- and multi-select. Active state uses primary fill.
export function PillButton({ label, selected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors active:scale-[0.98] ${
        selected
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground"
      }`}
    >
      {label}
    </button>
  );
}
