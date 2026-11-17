import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  fade?: boolean;
  variant?: "hero" | "guidance" | "journey" | "riasec" | "faq" | "scale";
}

const revealOffset = {
  hero: "",
  guidance: "",
  journey: "",
  riasec: "",
  faq: "",
  scale: "scale-[0.95]",
} as const;

function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 700,
  fade = false,
  variant = "hero",
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(
    () => typeof IntersectionObserver === "undefined",
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-landing-reveal={variant}
      data-reveal-duration={duration}
      data-reveal-fade={fade}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
      }}
      className={cn(
        "transition-transform ease-[cubic-bezier(0.2,0.75,0.25,1)] motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none",
        isVisible
          ? "landing-reveal-visible translate-x-0 translate-y-0 scale-100 opacity-100"
          : cn(fade ? "opacity-0" : "opacity-100", revealOffset[variant]),
        className,
      )}
    >
      {children}
    </div>
  );
}

export { ScrollReveal };
