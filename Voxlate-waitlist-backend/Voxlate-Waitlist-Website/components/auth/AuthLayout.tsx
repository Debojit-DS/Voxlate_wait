export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:flex md:w-1/2 bg-footer-bg flex-col justify-center items-center px-12">
        <div className="max-w-sm text-center">
          <h1 className="text-3xl font-bold text-text-on-navy tracking-tight">VOXLATE</h1>
          <p className="mt-4 text-text-on-navy-muted text-sm leading-relaxed">
            Real-time AI translation that preserves your voice, tone and emotion.
          </p>
        </div>
      </div>
      <div className="flex w-full md:w-1/2 bg-surface items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}
