export function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <img
      src="/images/logo.jpeg"
      alt="Voxlate"
      className={className}
    />
  );
}
