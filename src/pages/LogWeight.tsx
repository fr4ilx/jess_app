import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Scale } from "lucide-react";
import { toast } from "sonner";

const today = () => new Date().toISOString().slice(0, 10);

const kgFromLb = (lb: number) => lb * 0.45359237;

export default function LogWeight() {
  const navigate = useNavigate();
  const [unit, setUnit] = useState<"lb" | "kg">("lb");
  const [value, setValue] = useState("");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");

  const numeric = Number(value);
  const valid = Number.isFinite(numeric) && numeric > 0;
  const kg = useMemo(() => (unit === "kg" ? numeric : kgFromLb(numeric)), [unit, numeric]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    // TODO: persist { weight_kg: kg, logged_at: date, note } to Supabase
    toast.success(`Weight logged: ${value} ${unit}`, {
      description: date === today() ? "Today's weigh-in saved" : `Saved for ${date}`,
    });
    navigate(-1);
  };

  return (
    <div className="flex min-h-screen flex-col px-5 pt-12 bottom-nav-safe">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur"
        aria-label="Back"
      >
        <ArrowLeft className="h-5 w-5 text-foreground" />
      </button>

      <header className="mb-8">
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blob-peach text-accent-foreground">
          <Scale className="h-5 w-5" />
        </div>
        <h1 className="font-serif text-4xl leading-tight tracking-tight text-ink">
          <span className="block font-bold">Today's</span>
          <span className="block italic font-normal text-primary">weight</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Quick morning weigh-in. We'll roll it into your weekly trend.
        </p>
      </header>

      <form onSubmit={submit} className="flex flex-1 flex-col gap-6">
        <div className="rounded-3xl bg-white/85 p-5 backdrop-blur shadow-[0_10px_30px_-15px_rgba(20,40,30,0.18)]">
          <div className="flex items-center justify-between">
            <label htmlFor="weight" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Weight
            </label>
            <div className="inline-flex rounded-full bg-muted p-1 text-xs font-semibold">
              {(["lb", "kg"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    unit === u ? "bg-ink text-white" : "text-muted-foreground"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <input
              id="weight"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0"
              className="w-full bg-transparent text-5xl font-bold text-ink outline-none placeholder:text-muted-foreground/40"
            />
            <span className="text-2xl font-semibold text-muted-foreground">{unit}</span>
          </div>
          {valid && unit === "lb" && (
            <p className="mt-1 text-xs text-muted-foreground">
              {kg.toFixed(1)} kg
            </p>
          )}
        </div>

        <div className="rounded-3xl bg-white/85 p-5 backdrop-blur shadow-[0_10px_30px_-15px_rgba(20,40,30,0.18)]">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Date
          </label>
          <input
            type="date"
            value={date}
            max={today()}
            onChange={(e) => setDate(e.target.value)}
            className="mt-2 w-full bg-transparent text-lg font-medium text-ink outline-none"
          />
        </div>

        <div className="rounded-3xl bg-white/85 p-5 backdrop-blur shadow-[0_10px_30px_-15px_rgba(20,40,30,0.18)]">
          <label htmlFor="note" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Note (optional)
          </label>
          <input
            id="note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="After workout, post-coffee…"
            className="mt-2 w-full bg-transparent text-base text-ink outline-none placeholder:text-muted-foreground/50"
          />
        </div>

        <button
          type="submit"
          disabled={!valid}
          className="mt-auto w-full rounded-full bg-ink py-4 text-base font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          Save weigh-in
        </button>
      </form>
    </div>
  );
}
