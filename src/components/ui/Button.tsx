import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "ink" | "outline" | "success";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-flag-red text-white font-extrabold border-0",
  ink: "bg-ink text-white font-extrabold border-0",
  outline: "bg-white text-ink font-bold border-2 border-ink",
  success: "bg-flag-green-dark text-white font-extrabold border-0",
};

// Every size keeps the 44px minimum tap target.
const SIZES: Record<Size, string> = {
  sm: "min-h-11 px-4 text-base rounded-xl",
  md: "min-h-12 px-5 text-lg rounded-[14px]",
  lg: "min-h-[60px] px-6 text-2xl rounded-[18px]",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonProps = CommonProps & Omit<ComponentProps<"button">, keyof CommonProps> & { href?: undefined };
type LinkProps = CommonProps & Omit<ComponentProps<typeof Link>, keyof CommonProps> & { href: string };

export function buttonClasses({ variant = "ink", size = "md", className }: Omit<CommonProps, "children">) {
  return `inline-flex cursor-pointer items-center justify-center gap-2.5 text-center no-underline transition-transform active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className ?? ""}`;
}

/** Chunky button. Pass `href` to render a link that looks like a button. */
export function Button(props: ButtonProps | LinkProps) {
  if (props.href !== undefined) {
    const { variant, size, className, children, ...rest } = props;
    return (
      <Link className={buttonClasses({ variant, size, className })} {...rest}>
        {children}
      </Link>
    );
  }
  const { variant, size, className, children, type = "button", ...rest } = props;
  return (
    <button type={type} className={buttonClasses({ variant, size, className })} {...rest}>
      {children}
    </button>
  );
}
