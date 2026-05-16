import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Syringe } from "lucide-react";
import { toast } from "sonner";

const MEDICATIONS = [
  "Ozempic",
  "Wegovy",
  "Mounjaro",
  "Zepbound",
  "Compounded Semaglutide",
  "Compounded Tirzepatide",
];

const COMMON_DOSES = ["0.25", "0.5", "1.0", "1.7", "2.0", "2.4"];

const SITES = [
  "Left thigh",
  "Right thigh",
  "Left abdomen",
  "Right abdomen",
  "Left arm",
  "Right arm",
];

const now = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export default function LogShot() {
  const navigate = useNavigate();
  const [medication, setMedication] = useState<string>(MEDICATIONS[0]);
  const [dose, setDose] = useState<string>("0.5");
  const [when, setWhen] = useState<string>(now());
  const [site, setSite] = useState<string>(SITES[2]);
  const [note, setNote] = useState<string>("");

  const valid = !!medication && !!dose && Number(dose) > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    // TODO: persist { medication, dose_mg, injected_at, site, note } to Supabase
    toast.success(`${medication} ${dose} mg logged`, {
      description: `${site} · ${new Date(when).toLocaleString(undefined, {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
      })}`,
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
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blob-sage/70 text-primary">
          <Syringe className="h-5 w-5" />
        </div>
        <h1 className="font-serif text-4xl leading-tight tracking-tight text-ink">
          <span className="block font-bold">Log a</span>
          <span className="block italic font-normal text-primary">shot</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track each dose so Panda can spot side-effect patterns.
        </p>
      </header>

      <form onSubmit={submit} className="space-y-5">
        {/* Medication */}
        <section className="rounded-3xl bg-white/85 p-5 backdrop-blur shadow-[0_10px_30px_-15px_rgba(20,40,30,0.18)]">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Medication
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {MEDICATIONS.map((m) => {
              const active = m === medication;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMedication(m)}
                  className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-transparent text-foreground hover:bg-muted/60"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </section>

        {/* Dose */}
        <section className="rounded-3xl bg-white/85 p-5 backdrop-blur shadow-[0_10px_30px_-15px_rgba(20,40,30,0.18)]">
          <div className="flex items-baseline justify-between">
            <label htmlFor="dose" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dose
            </label>
            <span className="text-xs text-muted-foreground">mg</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <input
              id="dose"
              type="number"
              inputMode="decimal"
              step="0.05"
              min="0"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder="0.0"
              className="w-full bg-transparent text-4xl font-bold text-ink outline-none placeholder:text-muted-foreground/40"
            />
            <span className="text-xl font-semibold text-muted-foreground">mg</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {COMMON_DOSES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDose(d)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  dose === d ? "bg-ink text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {d} mg
              </button>
            ))}
          </div>
        </section>

        {/* Time */}
        <section className="rounded-3xl bg-white/85 p-5 backdrop-blur shadow-[0_10px_30px_-15px_rgba(20,40,30,0.18)]">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            When
          </label>
          <input
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            className="mt-2 w-full bg-transparent text-lg font-medium text-ink outline-none"
          />
        </section>

        {/* Site */}
        <section className="rounded-3xl bg-white/85 p-5 backdrop-blur shadow-[0_10px_30px_-15px_rgba(20,40,30,0.18)]">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Injection site
          </label>
          <p className="mt-1 text-xs text-muted-foreground">
            Rotating sites helps reduce irritation.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {SITES.map((s) => {
              const active = s === site;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSite(s)}
                  className={`rounded-2xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-transparent text-foreground hover:bg-muted/60"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </section>

        {/* Note */}
        <section className="rounded-3xl bg-white/85 p-5 backdrop-blur shadow-[0_10px_30px_-15px_rgba(20,40,30,0.18)]">
          <label htmlFor="note" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Notes (optional)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Any side effects, energy, appetite changes…"
            className="mt-2 w-full resize-none bg-transparent text-base text-ink outline-none placeholder:text-muted-foreground/50"
          />
        </section>

        <button
          type="submit"
          disabled={!valid}
          className="w-full rounded-full bg-ink py-4 text-base font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          Save dose
        </button>
      </form>
    </div>
  );
}
