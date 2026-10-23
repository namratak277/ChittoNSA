import type { ComponentProps } from "react";

type Variant = "plain" | "raised" | "ink";

const VARIANTS: Record<Variant, string> = {
  plain: "bg-white text-ink border-[3px] border-ink",
  // Key cards (e.g. the storm event card) get a thicker border and an offset ink shadow.
  raised: "bg-page text-ink border-4 border-ink shadow-ink",
  ink: "bg-ink text-cream",
};

interface CardProps extends ComponentProps<"div"> {
  variant?: Variant;
}

export function Card({ variant = "plain", className, ...rest }: CardProps) {
  return <div className={`rounded-card p-5 ${VARIANTS[variant]} ${className ?? ""}`} {...rest} />;
}
