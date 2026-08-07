export function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <img
      src="/images/logo.svg"
      alt="Voxlate"
      className={className}
    />
  );
}
