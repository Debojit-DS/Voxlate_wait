"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useWaitlistModal } from "@/components/waitlist/WaitlistModalProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import { Logo } from "@/components/ui/Logo";

const COMPANY_LINKS = [
  { label: "About Our Team", href: "/about" },
  { label: "Our Mission", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Press Kit", href: "#" },
];
const PRODUCT_LINKS = [
  { label: "Digital Version", href: "/digital-version" },
  { label: "Physical Version", href: "/physical-version" },
  { label: "Features", href: "#" },
  { label: "Blog", href: "#" },
];
const SUPPORT_LINKS = [
  { label: "Careers", href: "/careers" },
  { label: "Contact Us", href: "#" },
  { label: "Privacy Policy", href: "/terms" },
  { label: "Terms of Service", href: "/terms" },
];

type FooterLink = { label: string; href: string };

function FooterLinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-text-on-navy mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="text-sm text-text-on-navy-muted hover:text-text-on-navy transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const { openModal } = useWaitlistModal();
  const { user, isLoading } = useAuth();
  const { openPrompt } = useAuthPrompt();

  const handleFooterWaitlist = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector("input");
    if (input && input.value.trim()) {
      if (!isLoading && user) {
        openModal("footer");
      } else {
        openPrompt();
      }
      input.value = "";
    }
  };

  return (
    <footer id="contact" className="bg-footer-bg">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr_1.5fr]">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Logo className="h-24 w-auto" />
              <span className="text-xl font-bold tracking-tight text-text-on-navy">VOXLATE</span>
            </div>
            <p className="text-sm text-text-on-navy-muted leading-relaxed mb-6">
              Real-time AI translation that preserves your voice, tone and emotion.
            </p>
            <div className="flex items-center gap-4">
              {[
                {
                  name: "LinkedIn",
                  href: "https://www.linkedin.com/company/the-sn-tech-corporation/posts",
                  clickable: true,
                  svg: (
                    <svg viewBox="0 0 382 382" className="h-5 w-5" fill="currentColor">
                      <path d="M347.445,0H34.555C15.471,0,0,15.471,0,34.555v312.889C0,366.529,15.471,382,34.555,382h312.889C366.529,382,382,366.529,382,347.444V34.555C382,15.471,366.529,0,347.445,0z M118.207,329.844c0,5.554-4.502,10.056-10.056,10.056H65.345c-5.554,0-10.056-4.502-10.056-10.056V150.403c0-5.554,4.502-10.056,10.056-10.056h42.806c5.554,0,10.056,4.502,10.056,10.056V329.844z M86.748,123.432c-22.459,0-40.666-18.207-40.666-40.666S64.289,42.1,86.748,42.1s40.666,18.207,40.666,40.666S109.208,123.432,86.748,123.432z M341.91,330.654c0,5.106-4.14,9.246-9.246,9.246H286.73c-5.106,0-9.246-4.14-9.246-9.246v-84.168c0-12.556,3.683-55.021-32.813-55.021c-28.309,0-34.051,29.066-35.204,42.11v97.079c0,5.106-4.139,9.246-9.246,9.246h-44.426c-5.106,0-9.246-4.14-9.246-9.246V149.593c0-5.106,4.14-9.246,9.246-9.246h44.426c5.106,0,9.246,4.14,9.246,9.246v15.655c10.497-15.753,26.097-27.912,59.312-27.912c73.552,0,73.131,68.716,73.131,106.472L341.91,330.654L341.91,330.654z"/>
                    </svg>
                  ),
                },
                {
                  name: "Instagram",
                  href: "https://www.instagram.com/voxlate.sn",
                  clickable: true,
                  svg: (
                    <svg viewBox="0 0 551.034 551.034" className="h-5 w-5" fill="currentColor">
                      <path d="M386.878,0H164.156C73.64,0,0,73.64,0,164.156v222.722c0,90.516,73.64,164.156,164.156,164.156h222.722c90.516,0,164.156-73.64,164.156-164.156V164.156C551.033,73.64,477.393,0,386.878,0z M495.6,386.878c0,60.045-48.677,108.722-108.722,108.722H164.156c-60.045,0-108.722-48.677-108.722-108.722V164.156c0-60.046,48.677-108.722,108.722-108.722h222.722c60.045,0,108.722,48.676,108.722,108.722L495.6,386.878L495.6,386.878z M275.517,133C196.933,133,133,196.933,133,275.516s63.933,142.517,142.517,142.517S418.034,354.1,418.034,275.516S354.101,133,275.517,133z M275.517,362.6c-48.095,0-87.083-38.988-87.083-87.083s38.989-87.083,87.083-87.083C323.612,188.434,362.6,227.422,362.6,275.516S323.612,362.6,275.517,362.6z M418.306,134.072c0,15.855-12.851,28.706-28.706,28.706s-28.706-12.851-28.706-28.706s12.851-28.706,28.706-28.706S418.306,118.217,418.306,134.072z"/>
                    </svg>
                  ),
                },
                {
                  name: "X",
                  href: "https://x.com/SNTechVoxlate",
                  clickable: true,
                  svg: (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  ),
                },
                {
                  name: "YouTube",
                  clickable: false,
                  svg: (
                    <svg viewBox="0 0 461.001 461.001" className="h-5 w-5" fill="currentColor">
                      <path d="M365.257,67.393H95.744C42.866,67.393,0,110.259,0,163.137v134.728c0,52.878,42.866,95.744,95.744,95.744h269.513c52.878,0,95.744-42.866,95.744-95.744V163.137C461.001,110.259,418.135,67.393,365.257,67.393z M300.506,237.056l-126.06,60.123c-3.359,1.602-7.239-0.847-7.239-4.568V168.607c0-3.774,3.982-6.22,7.348-4.514l126.06,63.881C304.363,229.873,304.298,235.248,300.506,237.056z"/>
                    </svg>
                  ),
                },
              ].map((social) =>
                social.clickable ? (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-text-on-navy/30 text-text-on-navy-muted hover:text-text-on-navy hover:border-text-on-navy transition-colors"
                  >
                    {social.svg}
                  </a>
                ) : (
                  <div
                    key={social.name}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-text-on-navy/30 text-text-on-navy-muted pointer-events-none"
                  >
                    {social.svg}
                  </div>
                )
              )}
            </div>
          </div>

          <FooterLinkColumn title="Company" links={COMPANY_LINKS} />
          <FooterLinkColumn title="Product" links={PRODUCT_LINKS} />
          <FooterLinkColumn title="Support" links={SUPPORT_LINKS} />

          <div>
            <h4 className="text-sm font-semibold text-text-on-navy mb-4">Stay Updated</h4>
            <p className="text-sm text-text-on-navy-muted leading-relaxed mb-4">
              Join our waitlist and get the latest updates on our progress.
            </p>
            <form
              onSubmit={handleFooterWaitlist}
              className="flex gap-2"
            >
              <input
                type="email"
                required
                placeholder="Email address"
                className="flex-1 rounded-input border border-text-on-navy/30 bg-transparent px-3 py-2 text-sm text-text-on-navy placeholder:text-text-on-navy-muted outline-none focus:border-orange"
              />
              <Button variant="primary-orange" type="submit" className="px-3">
                <Send size={16} />
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-text-on-navy/10 pt-6 text-center">
          <p className="text-xs text-text-on-navy-muted">© 2026 Voxlate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}



