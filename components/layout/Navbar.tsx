"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePageTransition } from "@/components/transitions/PageTransitionProvider";
import { Menu, X, User, Camera } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useGatedWaitlist } from "@/components/auth/useGatedWaitlist";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/components/auth/AuthProvider";
import { uploadPhoto } from "@/lib/uploadApi";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Digital Version", href: "/digital-version" },
  { label: "Physical Version", href: "/physical-version" },
  { label: "View our demo", href: "/demo" },
  { label: "Waitlist", href: "/waitlist" },
  { label: "About Us", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Join the Team", href: "/careers" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [photoMenuOpen, setPhotoMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { openWaitlist, isAuthenticated, logout } = useGatedWaitlist();
  const { user, updatePhoto } = useAuth();
  const { startTransition, isTransitioning } = usePageTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDemoPage = pathname === "/demo";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!photoMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-photo-menu]")) {
        setPhotoMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [photoMenuOpen]);

  const isDigitalVersionPage = pathname === "/digital-version";
  const isPhysicalVersionPage = pathname === "/physical-version";
  const isHomePage = pathname === "/";

  const headerClass = isDemoPage
    ? `sticky top-0 z-40 w-full transition-colors ${isScrolled ? "bg-bg-base/80 backdrop-blur-md border-b border-border-subtle" : "bg-transparent"}`
    : `sticky top-0 z-40 w-full transition-colors ${isScrolled ? "border-b border-border bg-bg-page" : "bg-bg-page"}`;

  const renderDesktopCta = () => {
    if (isAuthenticated && user) {
      return (
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              data-photo-menu
              onClick={() => setPhotoMenuOpen((prev) => !prev)}
              className="h-9 w-9 shrink-0 rounded-full border border-border bg-bg-surface-alt overflow-hidden flex items-center justify-center"
            >
              {user.photoUrl ? (
                <img src={user.photoUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <User className="text-text-muted" size={18} />
              )}
            </button>
            {photoMenuOpen && (
              <div data-photo-menu className="absolute right-0 mt-2 w-56 rounded-card border border-border bg-bg-surface shadow-lg z-50">
                <button
                  type="button"
                  onClick={() => {
                    setPhotoMenuOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-bg-surface-alt transition-colors"
                >
                  <Camera size={16} />
                  {user.photoUrl ? "Change photo" : "Upload photo"}
                </button>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (!file.type.startsWith("image/")) return;
              if (file.size > 10 * 1024 * 1024) return;
              const reader = new FileReader();
              reader.onload = async () => {
                const base64 = reader.result as string;
                const uploaded = await uploadPhoto(base64);
                if (uploaded) {
                  try {
                    const res = await fetch("/api/auth/me", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ photo: uploaded.url }),
                      credentials: "include",
                    });
                    const data = await res.json();
                    if (data.status === "success" && data.data?.photoUrl) {
                      updatePhoto(data.data.photoUrl);
                    }
                  } catch {
                    // ignore
                  }
                }
              };
              reader.readAsDataURL(file);
              e.target.value = "";
            }}
          />
          <Button variant="outline-navy" onClick={logout}>Sign Out</Button>
        </div>
      );
    }

    if (isHomePage || isDigitalVersionPage || isPhysicalVersionPage) {
      return (
        <>
          <Button variant="outline-navy" href="/login" className="whitespace-nowrap">Log In</Button>
          <Button variant="primary-navy" href="/signup" className="whitespace-nowrap">Sign Up</Button>
        </>
      );
    }

    return (
      <Button variant="primary-orange" onClick={() => openWaitlist("navbar")}>
        Join Waitlist
      </Button>
    );
  };

  const renderMobileCta = () => {
    if (isAuthenticated && user) {
      return (
        <div className="pt-2 flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              data-photo-menu
              onClick={() => setPhotoMenuOpen((prev) => !prev)}
              className="h-9 w-9 shrink-0 rounded-full border border-border bg-bg-surface-alt overflow-hidden flex items-center justify-center"
            >
              {user.photoUrl ? (
                <img src={user.photoUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <User className="text-text-muted" size={18} />
              )}
            </button>
            {photoMenuOpen && (
              <div data-photo-menu className="absolute right-0 mt-2 w-56 rounded-card border border-border bg-bg-surface shadow-lg z-50">
                <button
                  type="button"
                  onClick={() => {
                    setPhotoMenuOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-bg-surface-alt transition-colors"
                >
                  <Camera size={16} />
                  {user.photoUrl ? "Change photo" : "Upload photo"}
                </button>
              </div>
            )}
          </div>
          <Button variant="outline-navy" className="w-full" onClick={logout}>Sign Out</Button>
        </div>
      );
    }

    if (isHomePage || isDigitalVersionPage || isPhysicalVersionPage) {
      return (
        <div className="flex flex-col gap-2 pt-2">
          <Button variant="outline-navy" className="w-full whitespace-nowrap" href="/login">Log In</Button>
          <Button variant="primary-navy" className="w-full whitespace-nowrap" href="/signup">Sign Up</Button>
        </div>
      );
    }

    return (
      <div className="pt-2">
        <Button variant="primary-orange" className="w-full" onClick={() => { openWaitlist("navbar"); setMobileOpen(false); }}>
          Join Waitlist
        </Button>
      </div>
    );
  };

  return (
    <>
      <header className={headerClass}>
        <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-16 w-auto" />
              <div className="leading-none">
                <span className="block text-3xl font-bold tracking-tight text-text-primary">VOXLATE</span>
                <span className="block text-xs font-medium uppercase tracking-widest text-text-muted">Breaking Language Barriers</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-4 lg:gap-6 flex-shrink-0">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                const isDemoLink = link.href === "/demo";

                if (isDemoLink) {
                  return (
                    <button
                      key={link.label}
                      type="button"
                      onClick={() => {
                        if (pathname === "/demo" || isTransitioning) return;
                        startTransition();
                        setTimeout(() => {
                          router.push("/demo");
                        }, 1200);
                      }}
                      disabled={isTransitioning}
                      className={`whitespace-nowrap text-sm font-medium transition-colors ${
                        isActive ? "text-orange border-b-2 border-orange" : "text-text-primary hover:text-orange"
                      }`}
                    >
                      {link.label}
                    </button>
                  );
                }

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`whitespace-nowrap text-sm font-medium transition-colors ${
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
          <div className={`border-t ${isDemoPage ? "border-border-subtle bg-bg-base" : "border-border bg-bg-page"} md:hidden`}>
            <div className="mx-auto max-w-screen-2xl px-4 md:px-8 py-4 space-y-3">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                const isDemoLink = link.href === "/demo";

                if (isDemoLink) {
                  return (
                    <button
                      key={link.label}
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        if (pathname === "/demo" || isTransitioning) return;
                        startTransition();
                        setTimeout(() => {
                          router.push("/demo");
                        }, 1200);
                      }}
                      disabled={isTransitioning}
                      className={`block text-sm font-medium transition-colors whitespace-nowrap ${
                        isActive ? "text-orange" : "text-text-primary hover:text-orange"
                      }`}
                    >
                      {link.label}
                    </button>
                  );
                }

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block text-sm font-medium transition-colors whitespace-nowrap ${
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
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) return;
        if (file.size > 10 * 1024 * 1024) return;
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result as string;
          const uploaded = await uploadPhoto(base64);
          if (uploaded) {
            try {
              const res = await fetch("/api/auth/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ photo: uploaded.url }),
                credentials: "include",
              });
              const data = await res.json();
              if (data.status === "success" && data.data?.photoUrl) {
                updatePhoto(data.data.photoUrl);
              }
            } catch {
              // ignore
            }
          }
        };
        reader.readAsDataURL(file);
        e.target.value = "";
      }}
    />
    </>
  );
}




