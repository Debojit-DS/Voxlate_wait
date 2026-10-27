import { type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type ButtonProps = {
  /** primary: expressive InteractiveHoverButton treatment. Others share geometry with quieter motion. */
  variant?: "primary" | "secondary" | "quiet" | "primary-demo";
  children: ReactNode;
  icon?: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  /** Shows a stable busy state and blocks repeat activation. */
  loading?: boolean;
  /** Reference `wide` option: a wider minimum, capped to the container on small screens. */
  wide?: boolean;
  size?: "md" | "sm";
  className?: string;
  href?: string;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-semibold whitespace-nowrap select-none " +
  "transition-colors duration-150 disabled:cursor-not-allowed aria-disabled:cursor-not-allowed";

const sizes = {
  md: "h-12 text-[15px]",
  sm: "h-10 text-sm",
};

const variants = {
  primary: "ihb bg-primary text-white disabled:opacity-60 aria-disabled:opacity-60",
  secondary:
    "border border-line-strong bg-surface text-ink hover:bg-mist hover:border-primary disabled:opacity-60",
  quiet: "text-ink hover:bg-mist disabled:opacity-60",
  "primary-demo":
    "bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white hover:opacity-90 font-semibold shadow-lg shadow-blue-500/25 disabled:opacity-60",
};

export function Button({
  variant = "primary",
  children,
  icon: Icon,
  onClick,
  type = "button",
  disabled,
  loading,
  wide,
  size = "md",
  className = "",
  href,
}: ButtonProps) {
  const inactive = disabled || loading;
  const classes = `${base} ${sizes[size]} ${variants[variant]} ${variant === "primary" ? "px-8" : size === "md" ? "px-6" : "px-4"} ${
    wide ? "min-w-56 max-w-full" : ""
  } ${className}`;

  const content =
    variant === "primary" ? (
      <>
        <span className="ihb-dot" aria-hidden="true" />
        <span className="ihb-label">{children}</span>
        <span className="ihb-hover" aria-hidden="true">
          <span>{children}</span>
          <ArrowRight size={16} aria-hidden />
        </span>
      </>
    ) : (
      <>
        {children}
        {Icon && <Icon size={16} aria-hidden />}
      </>
    );

  if (href) {
    return (
      <Link href={href} aria-disabled={inactive} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={inactive} aria-busy={loading} className={classes}>
      {content}
    </button>
  );
}
