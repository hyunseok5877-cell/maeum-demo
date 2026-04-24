"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
};

export function Reveal({ children, delay = 0, as = "div", className = "" }: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.transitionDelay = `${delay}ms`;
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  const Tag = as as keyof React.JSX.IntrinsicElements;
  return (
    // @ts-expect-error ref polymorphic
    <Tag ref={ref} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}
