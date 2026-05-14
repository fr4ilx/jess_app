import type { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  suffix?: ReactNode; // e.g. "mg", "kg"
  hint?: string;
};

// Labeled input matching the existing app's input pattern (bg-secondary, rounded-xl).
export function TextField({ label, id, suffix, hint, className = "", ...rest }: Props) {
  return (
    <div>
      <label htmlFor={id} className="text-xs text-muted-foreground mb-1 block">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          {...rest}
          className={`w-full px-3 py-2.5 rounded-xl bg-secondary text-sm text-foreground border-0 focus:ring-2 focus:ring-primary outline-none ${
            suffix ? "pr-10" : ""
          } ${className}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}
