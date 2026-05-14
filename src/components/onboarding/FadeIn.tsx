import { useEffect, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  duration?: number; // ms
  className?: string;
};

// Lightweight CSS-only fade-in wrapper. Mounts visible after a single tick so
// the transition runs from opacity 0 → 1.
export function FadeIn({ children, duration = 200, className = "" }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${duration}ms ease-out`,
      }}
    >
      {children}
    </div>
  );
}
