"use client";

import { Suspense, useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { LogoLockup } from "@/components/ui/Logo";
import { safeRedirect } from "@/lib/safeRedirect";

function AdminLoginForm() {
  const id = useId();
  const router = useRouter();
  const params = useSearchParams();
  const from = safeRedirect(params.get("from")) || "/admin";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (json?.status !== "success") {
        setError(json?.message || "Wrong username or password.");
        return;
      }
      router.push(from.startsWith("/admin") ? from : "/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div>
        <label htmlFor={`${id}-user`} className="vx-field-label">
          Username
        </label>
        <input
          id={`${id}-user`}
          className="vx-field"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
        />
      </div>
      <div>
        <label htmlFor={`${id}-pass`} className="vx-field-label">
          Password
        </label>
        <div className="relative">
          <input
            id={`${id}-pass`}
            className="vx-field pr-12"
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-[8px] text-slate hover:bg-mist hover:text-ink"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-[14px] text-danger">
          {error}
        </p>
      )}
      <button type="submit" className="vx-btn w-full" disabled={loading || !username || !password}>
        {loading ? "Signing in…" : "Sign in"} <ArrowRight size={17} aria-hidden />
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-svh flex-col bg-page px-5 py-6 sm:px-10">
      <div className="flex items-center justify-between">
        <LogoLockup />
        <Link href="/" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-slate hover:text-ink">
          <ArrowLeft size={16} aria-hidden /> Back to site
        </Link>
      </div>
      <div className="my-auto w-full max-w-[400px] py-12 sm:ml-[8vw]">
        <p className="vx-label">Admin</p>
        <h1 className="vx-display mt-3 text-[clamp(2.4rem,6vw,3.4rem)] text-ink">Sign in</h1>
        <p className="mt-2 text-[15px] text-slate">Reviews, questions, contact messages, applications and the waitlist.</p>
        <div className="mt-8">
          <Suspense fallback={null}>
            <AdminLoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
