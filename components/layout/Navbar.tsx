"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Menu, User, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useGatedWaitlist } from "@/components/auth/useGatedWaitlist";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiRequest } from "@/lib/apiClient";
import { uploadPhoto } from "@/lib/uploadApi";

const PRODUCT_LINKS = [
  { label: "Digital", href: "/digital-version", note: "Software for Zoom, Meet and Teams. Your meeting, every language." },
  { label: "Physical", href: "/physical-version", note: "A wearable for face-to-face talk, in your own voice." },
];

const NAV_LINKS = [
  { label: "Demo", href: "/demo" },
  { label: "Waitlist", href: "/waitlist" },
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

/** Closes a popover on Escape (returning focus to its trigger) or on an outside click/focus. */
function useDismiss(open: boolean, close: () => void, root: RefObject<HTMLElement | null>, trigger: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        trigger.current?.focus();
      }
    };
    const onOutside = (e: Event) => {
      if (root.current && !root.current.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("focusin", onOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("focusin", onOutside);
    };
  }, [open, close, root, trigger]);
}

function Avatar({ name, photoUrl, size = 36 }: { name: string; photoUrl?: string; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-mist"
      style={{ width: size, height: size }}
    >
      {photoUrl ? (
        <img src={photoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <User className="text-slate" size={size / 2} aria-hidden />
      )}
      <span className="sr-only">{name}</span>
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { openWaitlist, isAuthenticated, logout } = useGatedWaitlist();
  const { user, updatePhoto } = useAuth();

  const [productsOpen, setProductsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [photoStatus, setPhotoStatus] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const productsRef = useRef<HTMLDivElement>(null);
  const productsButton = useRef<HTMLButtonElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const accountButton = useRef<HTMLButtonElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const mobileButton = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const closeProducts = () => setProductsOpen(false);
  const closeAccount = () => setAccountOpen(false);
  const closeMobile = () => setMobileOpen(false);
  useDismiss(productsOpen, closeProducts, productsRef, productsButton);
  useDismiss(accountOpen, closeAccount, accountRef, accountButton);
  useDismiss(mobileOpen, closeMobile, mobileRef, mobileButton);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#") || href.startsWith("#")) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };
  const productActive = PRODUCT_LINKS.some((l) => isActive(l.href));
  const loginHref = `/login?redirectTo=${encodeURIComponent(pathname || "/")}`;

  const handleLogout = async () => {
    setPhotoStatus(null);
    if (!(await logout())) setPhotoStatus("Couldn't sign out. Please try again.");
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setPhotoStatus("Please choose an image file.");
    if (file.size > 10 * 1024 * 1024) return setPhotoStatus("Image must be less than 10MB.");
    setPhotoStatus("Uploading photo…");
    const reader = new FileReader();
    reader.onload = async () => {
      const uploaded = await uploadPhoto(reader.result as string);
      if (!uploaded) return setPhotoStatus("Photo upload failed. Please try again.");
      try {
        const res = await apiRequest("/api/auth/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photo: uploaded.url }),
          credentials: "include",
        });
        const data = await res.json();
        if (data.status === "success" && data.data?.photoUrl) {
          updatePhoto(data.data.photoUrl);
          setPhotoStatus(null);
          return;
        }
      } catch {
        // fall through to the error message
      }
      setPhotoStatus("Photo could not be saved. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const linkClass = (active: boolean) =>
    `relative whitespace-nowrap px-1 py-2 text-[15px] font-medium transition-colors ${
      active ? "text-ink after:absolute after:inset-x-1 after:-bottom-0.5 after:h-[2px] after:rounded-full after:bg-primary" : "text-ink/65 hover:text-ink"
    }`;

  return (
    <header
      // No backdrop blur while the menu is open: backdrop-filter would become the containing block
      // of the fixed full-screen menu and collapse it to the header's height.
      className={`sticky top-0 z-40 h-[72px] border-b transition-[background-color,border-color] duration-300 ${
        mobileOpen ? "border-line bg-page" : scrolled ? "border-line bg-page/85 backdrop-blur-md" : "border-transparent bg-transparent"
      }`}
    >
      <div ref={mobileRef} className="page-container flex h-full items-center gap-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Voxlate home">
          <Logo className="h-9 w-auto" />
          <span className="text-[22px] font-bold tracking-[-0.03em] text-ink" style={{ fontFamily: "var(--font-display)" }} aria-hidden="true">
            Voxlate
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-6 min-[1120px]:flex">
          <div ref={productsRef} className="relative">
            <button
              ref={productsButton}
              type="button"
              aria-expanded={productsOpen}
              aria-controls="products-menu"
              onClick={() => setProductsOpen((o) => !o)}
              className={`${linkClass(productActive)} inline-flex items-center gap-1`}
            >
              Products
              <ChevronDown size={15} aria-hidden className={`transition-transform duration-200 ${productsOpen ? "rotate-180" : ""}`} />
            </button>
            {productsOpen && (
              <ul
                id="products-menu"
                className="absolute left-[-12px] top-full mt-3 grid w-[440px] grid-cols-2 gap-1 rounded-[12px] border border-line bg-surface p-2 shadow-[0_24px_48px_-24px_rgba(13,27,42,0.35)]"
              >
                {PRODUCT_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      onClick={closeProducts}
                      className="group block rounded-[8px] p-3 transition-colors hover:bg-mist"
                    >
                      <span className="flex items-center justify-between text-[15px] font-semibold text-ink">
                        {link.label}
                        <ArrowRight size={15} className="-translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
                      </span>
                      <span className="mt-1 block text-[13px] leading-snug text-slate">{link.note}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} aria-current={isActive(link.href) ? "page" : undefined} className={linkClass(isActive(link.href))}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-5 min-[1120px]:flex">
          {isAuthenticated && user ? (
            <div ref={accountRef} className="relative">
              <button
                ref={accountButton}
                type="button"
                aria-expanded={accountOpen}
                aria-controls="account-menu"
                aria-label="Account menu"
                onClick={() => setAccountOpen((o) => !o)}
                className="flex items-center gap-1 rounded-full p-0.5 transition-colors hover:bg-mist"
              >
                <Avatar name={user.name} photoUrl={user.photoUrl} />
                <ChevronDown size={14} className="mr-1 text-slate" aria-hidden />
              </button>
              {accountOpen && (
                <div
                  id="account-menu"
                  className="absolute right-0 top-full mt-3 w-64 rounded-[12px] border border-line bg-surface p-2 shadow-[0_24px_48px_-24px_rgba(13,27,42,0.35)]"
                >
                  <div className="border-b border-line px-3 pb-3 pt-2">
                    <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                    <p className="truncate text-[13px] text-slate">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="mt-1 block w-full rounded-[8px] px-3 py-2 text-left text-sm text-ink hover:bg-mist"
                  >
                    {user.photoUrl ? "Change photo" : "Upload photo"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountOpen(false);
                      void handleLogout();
                    }}
                    className="block w-full rounded-[8px] px-3 py-2 text-left text-sm text-ink hover:bg-mist"
                  >
                    Sign out
                  </button>
                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setAccountOpen(false)}
                      className="mt-1 block w-full rounded-[8px] border-t border-line px-3 py-2 text-left text-sm font-semibold text-primary hover:bg-mist"
                    >
                      Admin dashboard
                    </Link>
                  )}
                </div>
              )}
            </div>
          ) : (
            <Link href={loginHref} className="whitespace-nowrap text-[15px] font-medium text-ink/65 transition-colors hover:text-ink">
              Log in
            </Link>
          )}
          <button type="button" className="vx-btn vx-btn-sm" onClick={() => openWaitlist("navbar")}>
            Join the waitlist
          </button>
        </div>

        <button
          ref={mobileButton}
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-ink transition-colors hover:bg-mist min-[1120px]:hidden"
        >
          {mobileOpen ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
        </button>

        {mobileOpen && (
          <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-[72px] overflow-y-auto bg-page min-[1120px]:hidden">
            <nav aria-label="Mobile" className="page-container flex flex-col pb-10 pt-6">
              <p className="vx-label pb-2">Products</p>
              {PRODUCT_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className="border-b border-line py-3 text-[28px] font-bold tracking-[-0.02em] text-ink"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-6" />
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`border-b border-line py-3 text-[28px] font-bold tracking-[-0.02em] ${isActive(link.href) ? "text-primary" : "text-ink"}`}
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-8 flex flex-col gap-4">
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} photoUrl={user.photoUrl} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                      <div className="flex gap-4 text-[13px]">
                        <button type="button" className="text-link" onClick={() => fileInputRef.current?.click()}>
                          {user.photoUrl ? "Change photo" : "Upload photo"}
                        </button>
                        <button
                          type="button"
                          className="text-link"
                          onClick={() => {
                            closeMobile();
                            void handleLogout();
                          }}
                        >
                          Sign out
                        </button>
                        {user.role === "ADMIN" && (
                          <Link href="/admin" onClick={closeMobile} className="text-link font-semibold">
                            Admin
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href={loginHref} onClick={closeMobile} className="vx-link w-fit text-[17px]">
                    Log in
                  </Link>
                )}
                <button
                  type="button"
                  className="vx-btn w-full"
                  onClick={() => {
                    closeMobile();
                    openWaitlist("navbar");
                  }}
                >
                  Join the waitlist
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>

      {photoStatus && (
        <p role="status" className="page-container -mt-1 text-right text-[13px] text-slate">
          {photoStatus}
        </p>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} tabIndex={-1} aria-hidden="true" />
    </header>
  );
}
