type Props = { index: number; total: number };

export const PaginationDots = ({ index, total }: Props) => (
  <div className="flex items-center justify-center gap-2">
    {Array.from({ length: total }).map((_, i) => {
      const active = i === index;
      return (
        <span
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            active ? "w-7 bg-ink" : "w-2 bg-ink/20"
          }`}
        />
      );
    })}
  </div>
);
