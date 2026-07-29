import { type ComponentType } from "react";
import Link from "next/link";

type ButtonProps = {
  variant: "primary-orange" | "primary-navy" | "outline-navy" | "outline-on-navy";
  children: React.ReactNode;
  icon?: ComponentType<{ size?: number }>;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  href?: string;
};

export function Button({ variant, children, icon: Icon, onClick, type = "button", disabled, className = "", href }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 rounded-button px-6 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    "primary-orange": "bg-orange text-white hover:bg-orange-hover",
    "primary-navy": "bg-navy-cta text-white hover:bg-navy-cta/90",
    "outline-navy": "border border-border text-text-primary bg-transparent hover:bg-bg-surface-alt",
    "outline-on-navy": "border border-text-on-navy/30 text-text-on-navy bg-transparent hover:bg-white/10",
  };

  if (href) {
    return (
      <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
        {children}
        {Icon && <Icon size={16} />}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
      {Icon && <Icon size={16} />}
    </button>
  );
}
