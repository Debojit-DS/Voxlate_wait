"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useWaitlistModal } from "@/components/waitlist/WaitlistModalProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import { Logo } from "@/components/ui/Logo";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Digital Version", href: "/digital-version" },
  { label: "Physical Version", href: "/physical-version" },
  { label: "About Us", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { openModal } = useWaitlistModal();
  const { user, isLoading } = useAuth();
  const { openPrompt } = useAuthPrompt();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDigitalVersionPage = pathname === "/digital-version";
  const isPhysicalVersionPage = pathname === "/physical-version";
  const isHomePage = pathname === "/";

  const handleJoinWaitlist = () => {
    if (user) {
      openModal("navbar");
    } else {
      openPrompt();
    }
  };

  const renderDesktopCta = () => {
    if (!isLoading && user) {
      return (
        <span className="text-sm font-semibold text-text-primary italic">Join our journey</span>
      );
    }

    if (isHomePage || isDigitalVersionPage || isPhysicalVersionPage) {
      return (
        <>
          <Button variant="outline-navy" href="/login">Log In</Button>
          <Button variant="primary-navy" href="/signup">Sign Up</Button>
        </>
      );
    }

    return (
      <Button variant="primary-orange" onClick={handleJoinWaitlist}>
        Join Waitlist
      </Button>
    );
  };

  const renderMobileCta = () => {
    if (!isLoading && user) {
      return (
        <div className="pt-2">
          <span className="block text-sm font-semibold text-text-primary italic">Join our journey</span>
        </div>
      );
    }

    if (isHomePage || isDigitalVersionPage || isPhysicalVersionPage) {
      return (
        <div className="flex flex-col gap-2 pt-2">
          <Button variant="outline-navy" className="w-full" href="/login">Log In</Button>
          <Button variant="primary-navy" className="w-full" href="/signup">Sign Up</Button>
        </div>
      );
    }

    return (
      <div className="pt-2">
        <Button variant="primary-orange" className="w-full" onClick={() => { handleJoinWaitlist(); setMobileOpen(false); }}>
          Join Waitlist
        </Button>
      </div>
    );
  };

  return (
    <header className={`sticky top-0 z-40 w-full transition-colors ${isScrolled ? "border-b border-border bg-bg-page" : "bg-bg-page"}`}>
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="flex h-[120px] items-center justify-between">
          <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-24 w-auto" />
            <div className="leading-none">
              <span className="block text-4xl font-bold tracking-tight text-text-primary">VOXLATE</span>
              <span className="block text-sm font-medium uppercase tracking-widest text-text-muted">Breaking Language Barriers</span>
            </div>
          </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive ? "text-orange border-b-2 border-orange" : "text-text-primary hover:text-orange"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {renderDesktopCta()}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-text-primary"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-bg-page md:hidden">
          <div className="mx-auto max-w-[1200px] px-6 py-4 space-y-3">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block text-sm font-medium transition-colors ${
                    isActive ? "text-orange" : "text-text-primary hover:text-orange"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {renderMobileCta()}
          </div>
        </div>
      )}
    </header>
  );
}
