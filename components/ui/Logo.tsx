export function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <img
      src="/images/logo.webp"
      alt="Voxlate"
      className={className}
    />
  );
}


