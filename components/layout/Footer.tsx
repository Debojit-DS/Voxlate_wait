"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { LogoLockup } from "@/components/ui/Logo";

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

const NAVIGATE_LINKS = [
  { label: "Homepage", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Team", href: "/about#team" },
  { label: "Digital Version", href: "/digital-version" },
  { label: "Physical Version", href: "/physical-version" },
  { label: "Features", href: "/digital-version#features" },
  { label: "Testimonials", href: "/#testimonials" },
];

const COMMUNITY_LINKS = [
  { label: "Early Access Waitlist", href: "/waitlist" },
  { label: "WhatsApp Community", href: "https://chat.whatsapp.com", external: true },
  { label: "Telegram Channel", href: "https://t.me/voxlate", external: true },
  { label: "Careers", href: "/careers" },
  { label: "Our Mission", href: "/about#mission" },
  { label: "Try Demo", href: "/demo" },
];

const SUPPORT_LINKS = [
  { label: "FAQs", href: "/#faq" },
  { label: "Contact Us", href: "mailto:support@voxlate.com", isMail: true },
  { label: "Admin Portal", href: "/admin" },
  { label: "Speech Translation Demo", href: "/demo" },
  { label: "System Documentation", href: "/digital-version#features" },
];

export function Footer() {
  return (
    <footer id="contact" className="mt-auto border-t border-line bg-surface">
      <div className="page-container py-14 md:py-18">
        {/* Main Footer Columns */}
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-14">
          {/* Brand & Social Column */}
          <div className="flex flex-col items-start">
            <LogoLockup />

            <p className="mt-4 max-w-[38ch] text-[14px] leading-relaxed text-slate">
              We&apos;re more than a platform — we&apos;re a community breaking language barriers through real-time AI translation, preserving human voice, tone, and emotion across borders.
            </p>

            {/* Company attribution */}
            <div className="mt-5 flex items-center gap-3">
              <Image
                src="/images/Comapany-logo.png"
                alt="SN Tech Corporation"
                width={37}
                height={48}
                className="h-10 w-auto opacity-90"
              />
              <span className="text-[13px] font-medium text-ink">
                Product of SN Tech Corporation
              </span>
            </div>

            {/* Social Icon Pills */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              {SOCIAL_LINKS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="h-10 w-10 rounded-xl border border-line bg-surface flex items-center justify-center text-slate hover:text-ink hover:bg-mist hover:border-primary/40 transition-all duration-200 shadow-xs cursor-pointer"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column: Navigate */}
          <div>
            <h3 className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.16em] text-ink">
              NAVIGATE
            </h3>
            <ul className="mt-4 space-y-3 text-[14px]">
              {NAVIGATE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column: Community */}
          <div>
            <h3 className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.16em] text-ink">
              COMMUNITY
            </h3>
            <ul className="mt-4 space-y-3 text-[14px]">
              {COMMUNITY_LINKS.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-slate hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column: Support */}
          <div>
            <h3 className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.16em] text-ink">
              SUPPORT
            </h3>
            <ul className="mt-4 space-y-3 text-[14px]">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  {link.isMail ? (
                    <a
                      href={link.href}
                      className="inline-flex items-center gap-1.5 text-slate hover:text-primary transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5 shrink-0 text-slate" aria-hidden="true" />
                      <span>{link.label}</span>
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-slate hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-6 border-t border-line/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-slate">
          <p>© 2026 Voxlate by SN Tech Corporation. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-ink transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-ink transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
