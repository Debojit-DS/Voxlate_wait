import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LogoLockup } from "@/components/ui/Logo";
import { Footer } from "@/components/layout/Footer";

/** Quiet frame for login/signup: identity, a way back, and the form. */
export function AuthShell({
  title,
  subtitle,
  icon,
  children,
}: {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <header className="page-container flex items-center justify-between gap-4 py-5">
        <LogoLockup />
        <Link href="/" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-slate hover:text-ink transition-colors">
          <ArrowLeft size={16} aria-hidden />
          Back to Home
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-20 pt-4 sm:pt-8 md:pt-10">
        <div className="w-full max-w-[440px] rounded-[24px] border border-line bg-surface p-7 sm:p-9 shadow-[0_8px_30px_rgba(24,43,58,0.04)]">
          {icon && <div className="mb-4 flex justify-center">{icon}</div>}
          {title && (
            <div className={icon ? "text-center mb-6" : ""}>
              <h1 className="font-display text-[30px] sm:text-[34px] font-semibold leading-tight text-ink">{title}</h1>
              {subtitle && <p className="mt-1.5 text-[14px] sm:text-[15px] text-slate">{subtitle}</p>}
            </div>
          )}
          <div className={title && !icon ? "mt-8" : ""}>{children}</div>
        </div>
      </main>
      <Footer />
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
