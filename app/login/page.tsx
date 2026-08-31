"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { loginUser } from "@/lib/authApi";
import { loginSchema, type LoginFormValues } from "@/lib/authValidation";
import { Button } from "@/components/ui/Button";
import { AuthFormError } from "@/components/auth/AuthFormError";
import { Footer } from "@/components/layout/Footer";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // const getRedirectTarget = useCallback(() => {
  //   try {
  //     const params = new URLSearchParams(window.location.search);
  //     const urlRedirect = params.get("redirectTo");
  //     const storedRedirect = sessionStorage.getItem("redirectTo");
  //     return urlRedirect || storedRedirect || "/";
  //   } catch {
  //     return "/";
  //   }
  // }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true);
    setFormError(null);
    const result = await loginUser(values);
    setIsSubmitting(false);

    if (result.status === "success") {
      login(result.data);
      setSuccess(true);
      const redirectTo = searchParams.get("redirectTo") || "/";
      setTimeout(() => router.push(redirectTo), 1500);
    } else if (result.code === "invalid_credentials") {
      setFormError("That email or password doesn't look right. Please try again.");
    } else if (result.code === "server_error") {
      setFormError("Something went wrong. Please try again.");
    } else {
      setFormError(result.message);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-[420px] text-center">
            <div className="text-success mb-4">
              <svg className="mx-auto" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Signed in</h2>
            <p className="mt-2 text-text-secondary text-sm">Redirecting you...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="w-full px-6 py-6">
        <div className="mx-auto max-w-[1200px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="h-16 w-auto" />
            <div className="leading-none">
              <span className="block text-3xl font-bold tracking-tight text-text-primary">VOXLATE</span>
              <span className="block text-xs font-medium uppercase tracking-widest text-text-muted">Breaking Language Barriers</span>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-[420px]">
          <div className="rounded-card bg-surface p-8 shadow-sm border border-border">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-text-primary">Welcome Back</h1>
              <p className="mt-2 text-text-secondary text-sm">Login to access your Voxlate account.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" aria-busy={isSubmitting}>
              {formError && <AuthFormError message={formError} />}

              <div>
                <label htmlFor="email" className="sr-only">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2" />
                  <input
                    id="email"
                    type="email"
                    placeholder="Email Address"
                    className={`border rounded-input h-12 w-full bg-white pl-10 pr-4 text-sm outline-none transition-colors focus:border-orange focus:ring-2 focus:ring-orange/15 ${errors.email ? "border-danger" : "border-border"}`}
                    {...register("email")}
                  />
                </div>
                {errors.email && <p className="text-danger mt-1 text-sm">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                  <Lock size={18} className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className={`border rounded-input h-12 w-full bg-white pr-11 pl-10 text-sm outline-none transition-colors focus:border-orange focus:ring-2 focus:ring-orange/15 ${errors.password ? "border-danger" : "border-border"}`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-text-muted absolute top-1/2 right-3 -translate-y-1/2"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-danger mt-1 text-sm">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 rounded border-border text-orange focus:ring-orange" />
                  <span className="text-sm text-text-secondary">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-orange hover:underline">
                  Forgot Password?
                </Link>
              </div>

              <Button variant="primary-navy" type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Log In"}
              </Button>

              <p className="text-center text-sm text-text-secondary mt-6">
                Don&apos;t have an account?{" "}
                <Link 
                  href={`/signup${searchParams.toString() ? `?${searchParams.toString()}` : ""}`} 
                  className="text-orange font-semibold hover:underline"
               >
                Sign up
              </Link>
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
