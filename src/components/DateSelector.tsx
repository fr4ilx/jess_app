import { useState } from "react";
import { ChevronsLeft } from "lucide-react";

const DAY_LETTERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const addDays = (d: Date, n: number) => {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
};

const naturalLabel = (selected: Date, today: Date) => {
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  const s = new Date(selected);
  s.setHours(0, 0, 0, 0);
  const diff = Math.round((s.getTime() - t.getTime()) / (24 * 60 * 60 * 1000));
  const dateStr = selected.toLocaleString("en-US", { month: "short", day: "numeric" });
  if (diff === 0) return `Today, ${dateStr}`;
  if (diff === 1) return `Tomorrow, ${dateStr}`;
  if (diff === -1) return `Yesterday, ${dateStr}`;
  return selected.toLocaleString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

type Props = {
  /** Currently selected date — controls the chip strip + label */
  value?: Date;
  /** Called when the user picks a date from the strip */
  onChange?: (d: Date) => void;
};

/**
 * Always-visible 7-day calendar strip — creates a "diary" feel for the
 * header of Home and Progress. The strip is centered on the selected
 * date; tapping a chip moves the selection. A "« Today" link returns to
 * today when off it.
 */
export function DateStrip({ value, onChange }: Props) {
  const today = new Date();
  const [internal, setInternal] = useState<Date>(value ?? today);
  const selected = value ?? internal;

  const setDate = (d: Date) => {
    if (onChange) onChange(d);
    else setInternal(d);
  };

  // 7-day window: 3 days before selected, selected, 3 days after
  const strip = Array.from({ length: 7 }, (_, i) => addDays(selected, i - 3));
  const isOnToday = isSameDay(selected, today);

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-1">
        {strip.map((d) => {
          const sel = isSameDay(d, selected);
          const isTodayCell = isSameDay(d, today);
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => setDate(d)}
              className="flex flex-col items-center gap-1 rounded-2xl py-1 transition-colors active:bg-muted/40"
            >
              <span
                className={`text-[11px] font-semibold ${
                  isTodayCell ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {DAY_LETTERS[d.getDay()]}
              </span>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  sel
                    ? "bg-primary text-white"
                    : isTodayCell
                    ? "text-primary"
                    : "text-foreground"
                }`}
              >
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-1 flex items-center justify-between px-1">
        <span className={`text-sm font-semibold ${isOnToday ? "text-foreground" : "text-primary"}`}>
          {naturalLabel(selected, today)}
        </span>
        {!isOnToday && (
          <button
            type="button"
            onClick={() => setDate(today)}
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
            Today
          </button>
        )}
      </div>
    </div>
  );
}

// Keep the old export name for backwards compatibility
export { DateStrip as DateSelector };
