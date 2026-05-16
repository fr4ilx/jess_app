import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { PaginationDots } from "./PaginationDots";

type Props = {
  eyebrow: string;
  widget: ReactNode;
  headlineLead: string;
  headlineItalic: string;
  body: string;
  ctaLabel: string;
  nextPath: string;
  index: number;
  total: number;
};

export const IntroScreen = ({
  eyebrow,
  widget,
  headlineLead,
  headlineItalic,
  body,
  ctaLabel,
  nextPath,
  index,
  total,
}: Props) => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full">
      <div className="relative z-10 flex min-h-screen flex-col px-6 pb-8 pt-14">
        {/* Eyebrow chip */}
        <div className="flex justify-center">
          <span className="rounded-full bg-white/70 px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-primary backdrop-blur">
            {eyebrow}
          </span>
        </div>

        {/* Widget */}
        <div className="mt-8 flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">{widget}</div>
        </div>

        {/* Headline */}
        <div className="mt-2 px-1">
          <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-ink">
            <span className="block font-bold">{headlineLead}</span>
            <span className="block font-normal italic text-primary">
              {headlineItalic}
            </span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            {body}
          </p>
        </div>

        {/* Dots + CTA */}
        <div className="mt-8 flex flex-col items-stretch gap-5">
          <PaginationDots index={index} total={total} />
          <button
            onClick={() => navigate(nextPath)}
            className="w-full rounded-full bg-ink py-5 text-base font-semibold text-white transition-transform active:scale-[0.98]"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
