import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const SOCIAL_LINKS = [
  {
    label: "X (Twitter)",
    href: "https://x.com/SNTechVoxlate",
    icon: (
      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/the-sn-tech-corporation/posts",
    icon: (
      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/voxlate.sn",
    icon: (
      <svg className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: "Telegram",
    href: "https://t.me/voxlate",
    icon: (
      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@voxlate",
    icon: (
      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

const COLUMNS: { title: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Digital version", href: "/digital-version" },
      { label: "Physical version", href: "/physical-version" },
      { label: "Reviews", href: "/#testimonials" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Our team", href: "/about#team" },
      { label: "Join our team", href: "/careers" },
      { label: "Contact", href: "/contact" },
      { label: "Investors", href: "/contact?for=investor" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Waitlist", href: "/waitlist" },
      { label: "Telegram", href: "https://t.me/voxlate", external: true },
      { label: "WhatsApp", href: "https://chat.whatsapp.com", external: true },
      { label: "Email us", href: "mailto:voxlatesn@gmail.com", external: true },
    ],
  },
];

/** Site footer: night navy, so it reads as the closing chapter of every page. */
export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-night text-page">
      <div className="page-container pt-16 lg:pt-24">
        <div className="grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <div>
            <p className="vx-display max-w-[16ch] text-[clamp(2rem,4.4vw,3.5rem)]">
              Natural translation, in your own voice.
            </p>
            <p className="mt-5 max-w-[44ch] text-[15px] leading-relaxed text-page/65">
              Voxlate keeps your tone, your pace and the person behind the words, so every conversation still sounds
              like the people having it.
            </p>
            <Link
              href="/waitlist"
              className="mt-8 inline-flex items-center gap-2 border-b border-page/40 pb-1 text-[16px] font-semibold transition-colors hover:border-page"
            >
              Join the waitlist <ArrowUpRight size={17} aria-hidden />
            </Link>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h2 className="text-[13px] font-medium text-page/50">{col.title}</h2>
                <ul className="mt-4 space-y-2.5 text-[15px]">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                          rel="noopener noreferrer"
                          className="break-all text-page/85 transition-colors hover:text-page"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link href={link.href} className="text-page/85 transition-colors hover:text-page">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-page/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-page">
              <Logo className="h-9 w-auto" />
            </span>
            <span className="flex items-center gap-2.5 text-[13px] text-page/65">
              <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-page">
                <Image src="/images/Comapany-logo.png" alt="" width={37} height={48} className="h-6 w-auto" />
              </span>
              A product of SN Tech Corporation
            </span>
          </div>
          <ul className="flex items-center gap-1">
            {SOCIAL_LINKS.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="flex h-10 w-10 items-center justify-center rounded-[8px] text-page/70 transition-colors hover:bg-page/10 hover:text-page"
                >
                  {item.icon}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3 py-6 text-[13px] text-page/50 sm:flex-row sm:justify-between">
          <p>© 2026 Voxlate by SN Tech Corporation. All rights reserved.</p>
          <p className="flex gap-5">
            <Link href="/privacy" className="transition-colors hover:text-page">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-page">
              Terms
            </Link>
            <Link href="/admin" className="transition-colors hover:text-page">
              Admin
            </Link>
          </p>
        </div>
      </div>

      {/* Oversized wordmark, cut by the page edge. */}
      <p
        aria-hidden="true"
        className="pointer-events-none -mb-[0.24em] select-none whitespace-nowrap text-center font-bold leading-none tracking-[-0.06em] text-page/[0.06]"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(6rem, 22vw, 22rem)" }}
      >
        voxlate
      </p>
    </footer>
  );
}
