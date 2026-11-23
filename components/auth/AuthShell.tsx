import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo, LogoLockup } from "@/components/ui/Logo";

const WORDS = [
  { text: "नमस्ते", lang: "hi" },
  { text: "Hola", lang: "es" },
  { text: "বন্ধু", lang: "bn" },
  { text: "Merci", lang: "fr" },
  { text: "நன்றி", lang: "ta" },
  { text: "Danke", lang: "de" },
];

/**
 * Login / sign-up frame: a quiet split screen with no site navigation or footer.
 * Left: what you're signing in to. Right: the form.
 */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  /** Accepted for compatibility; the redesigned frame shows no icon. */
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh bg-page lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-night p-12 text-page lg:flex lg:flex-col">
        <Link href="/" className="flex w-fit items-center gap-3" aria-label="Voxlate home">
          <span className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-page">
            <Logo className="h-9 w-auto" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Voxlate</span>
        </Link>

        <div className="mt-auto">
          <ul aria-hidden="true" className="mb-10 flex flex-wrap gap-x-4 gap-y-2 text-[18px] text-page/45" style={{ fontFamily: "var(--font-indic)" }}>
            {WORDS.map((w, i) => (
              <li key={w.text} lang={w.lang} className="flex items-center gap-4">
                {i > 0 && <span className="h-1 w-1 rounded-full bg-page/30" />}
                {w.text}
              </li>
            ))}
          </ul>
          <p className="vx-display max-w-[14ch] text-[clamp(2.4rem,3.6vw,3.6rem)]">
            Speak in yours.
            <br />
            <span className="text-[#9fb2ff]">Be heard in theirs.</span>
          </p>
          <p className="mt-5 max-w-[40ch] text-[15px] leading-relaxed text-page/65">
            One account for the waitlist, the web demo and your reviews.
          </p>
        </div>
      </aside>

      {/* Form */}
      <main className="flex flex-col px-5 pb-16 pt-6 sm:px-10 lg:px-16 lg:pt-10">
        <div className="flex items-center justify-between gap-4">
          <span className="lg:invisible">
            <LogoLockup />
          </span>
          <Link href="/" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-slate transition-colors hover:text-ink">
            <ArrowLeft size={16} aria-hidden />
            Back to home
          </Link>
        </div>
        <div className="mx-auto my-auto w-full max-w-[420px] pt-10 lg:pt-0">
          {title && (
            <div>
              <h1 className="vx-display text-[clamp(2.2rem,5vw,3rem)] text-ink">{title}</h1>
              {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-slate">{subtitle}</p>}
            </div>
          )}
          <div className={title ? "mt-8" : ""}>{children}</div>
        </div>
      </main>
    </div>
  );
}

export function AuthStatus({ title, message }: { title: string; message: string }) {
  return (
    <AuthShell title={title} subtitle={message}>
      <p role="status" className="sr-only">{`${title}. ${message}`}</p>
    </AuthShell>
  );
}
