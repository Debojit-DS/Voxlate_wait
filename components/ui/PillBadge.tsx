type PillBadgeProps = {
  children: React.ReactNode;
  variant?: "success" | "info";
};

export function PillBadge({ children, variant = "info" }: PillBadgeProps) {
  const styles = {
    success: "bg-success-tint text-success",
    info: "bg-bg-surface-alt text-text-primary",
  };

  return (
    <span className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-semibold ${styles[variant]}`}>
      {children}
    </span>
  );
}
