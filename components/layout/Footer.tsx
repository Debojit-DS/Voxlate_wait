"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useWaitlistModal } from "@/components/waitlist/WaitlistModalProvider";
import { Logo } from "@/components/ui/Logo";

const COMPANY_LINKS = [
  { label: "About Us", href: "#" },
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
  { label: "Help Center", href: "#" },
  { label: "Contact Us", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
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

  return (
    <footer id="contact" className="bg-footer-bg">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr_1.5fr]">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Logo className="h-24 w-auto" />
              <span className="text-4xl font-bold tracking-tight text-text-on-navy">VOXLATE</span>
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
                  name: "Twitter",
                  clickable: false,
                  svg: (
                    <svg viewBox="0 0 410.155 410.155" className="h-5 w-5" fill="currentColor">
                      <path d="M403.632,74.18c-9.113,4.041-18.573,7.229-28.28,9.537c10.696-10.164,18.738-22.877,23.275-37.067l0,0c1.295-4.051-3.105-7.554-6.763-5.385l0,0c-13.504,8.01-28.05,14.019-43.235,17.862c-0.881,0.223-1.79,0.336-2.702,0.336c-2.766,0-5.455-1.027-7.57-2.891c-16.156-14.239-36.935-22.081-58.508-22.081c-9.335,0-18.76,1.455-28.014,4.325c-28.672,8.893-50.795,32.544-57.736,61.724c-2.604,10.945-3.309,21.9-2.097,32.56c0.139,1.225-0.44,2.08-0.797,2.481c-0.627,0.703-1.516,1.106-2.439,1.106c-0.103,0-0.209-0.005-0.314-0.015c-62.762-5.831-119.358-36.068-159.363-85.14l0,0c-2.04-2.503-5.952-2.196-7.578,0.593l0,0C13.677,65.565,9.537,80.937,9.537,96.579c0,23.972,9.631,46.563,26.36,63.032c-7.035-1.668-13.844-4.295-20.169-7.808l0,0c-3.06-1.7-6.825,0.485-6.868,3.985l0,0c-0.438,35.612,20.412,67.3,51.646,81.569c-0.629,0.015-1.258,0.022-1.888,0.022c-4.951,0-9.964-0.478-14.898-1.421l0,0c-3.446-0.658-6.341,2.611-5.271,5.952l0,0c10.138,31.651,37.39,54.981,70.002,60.278c-27.066,18.169-58.585,27.753-91.39,27.753l-10.227-0.006c-3.151,0-5.816,2.054-6.619,5.106c-0.791,3.006,0.666,6.177,3.353,7.74c36.966,21.513,79.131,32.883,121.955,32.883c37.485,0,72.549-7.439,104.219-22.109c29.033-13.449,54.689-32.674,76.255-57.141c20.09-22.792,35.8-49.103,46.692-78.201c10.383-27.737,15.871-57.333,15.871-85.589v-1.346c-0.001-4.537,2.051-8.806,5.631-11.712c13.585-11.03,25.415-24.014,35.16-38.591l0,0C411.924,77.126,407.866,72.302,403.632,74.18L403.632,74.18z"/>
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
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.querySelector("input");
                if (input && input.value.trim()) {
                  openModal("footer");
                  input.value = "";
                }
              }}
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
