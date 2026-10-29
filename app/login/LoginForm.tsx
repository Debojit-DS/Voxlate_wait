"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { loginUser } from "@/lib/authApi";
import { loginSchema, type LoginFormValues } from "@/lib/authValidation";
import { safeRedirect } from "@/lib/safeRedirect";
import { Button } from "@/components/ui/Button";
import { AuthFormError } from "@/components/auth/AuthFormError";
import { AuthShell, AuthStatus } from "@/components/auth/AuthShell";
import { useAuth } from "@/components/auth/AuthProvider";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const redirectTo = safeRedirect(searchParams.get("redirectTo"));
  const queryString = searchParams.toString();
  const errorParam = searchParams.get("error");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  useEffect(() => {
    if (errorParam) {
      if (errorParam === "AccessDenied") {
        setFormError("Google sign-in was cancelled or access was denied.");
      } else if (errorParam === "OAuthCallback" || errorParam === "OAuthSignin") {
        setFormError("Could not authenticate with Google. Please try again.");
      } else {
        setFormError("Authentication error. Please try again.");
      }
    }
  }, [errorParam]);

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("voxlate_remember_email");
      if (savedEmail) {
        setValue("email", savedEmail);
        setRememberMe(true);
      }
    } catch {
      // Ignore localStorage availability errors
    }
  }, [setValue]);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setFormError(null);
      await signIn("google", { callbackUrl: redirectTo || "/" });
    } catch (err) {
      console.error("Google signIn error:", err);
      setFormError("Failed to connect to Google. Please try again.");
      setGoogleLoading(false);
    }
  };

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (rememberMe) {
        localStorage.setItem("voxlate_remember_email", values.email);
      } else {
        localStorage.removeItem("voxlate_remember_email");
      }
    } catch {
      // Ignore localStorage error
    }

    const result = await loginUser(values);
    setIsSubmitting(false);

    if (result.status === "success") {
      login(result.data);
      setSuccess(true);
      setTimeout(() => router.push(redirectTo), 1500);
    } else if (result.code === "invalid_credentials") {
      setFormError("That email or password doesn't look right. Please try again.");
    } else if (result.code === "server_error") {
      setFormError("Something went wrong. Please try again.");
    } else {
      setFormError(result.message);
    }
  }

  if (success) return <AuthStatus title="Signed in" message="Redirecting you..." />;

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign in to access your account"
      icon={
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary shadow-xs">
          <Lock className="h-6 w-6 text-primary" strokeWidth={2} />
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-busy={isSubmitting || googleLoading} noValidate>
        {formError && <AuthFormError message={formError} />}

        {/* Email Address */}
        <div>
          <label htmlFor="email" className="block text-[13px] font-medium text-ink mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/70"
              aria-hidden="true"
            />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={errors.email ? true : undefined}
              className="w-full h-11 sm:h-12 rounded-[10px] border border-line bg-surface pl-10 pr-4 text-[14px] sm:text-[15px] text-ink placeholder:text-slate/40 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              {...register("email")}
            />
          </div>
          {errors.email?.message && (
            <p className="mt-1 text-[12px] text-danger">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-[13px] font-medium text-ink mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/70"
              aria-hidden="true"
            />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={errors.password ? true : undefined}
              className="w-full h-11 sm:h-12 rounded-[10px] border border-line bg-surface pl-10 pr-11 text-[14px] sm:text-[15px] text-ink placeholder:text-slate/40 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate/70 hover:text-ink transition-colors cursor-pointer rounded-md"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
            </button>
          </div>
          {errors.password?.message && (
            <p className="mt-1 text-[12px] text-danger">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between text-[13px] pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate hover:text-ink transition-colors">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-line text-primary focus:ring-primary/30 accent-primary cursor-pointer"
            />
            <span>Remember me</span>
          </label>
          <a
            href="mailto:support@voxlate.com?subject=Password%20Reset%20Request"
            className="font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Forgot password?
          </a>
        </div>

        {/* Sign In Button */}
        <div className="pt-2">
          <Button
            type="submit"
            className="w-full h-11 sm:h-12 rounded-[10px] bg-primary hover:bg-primary-hover text-white text-[15px] font-medium shadow-xs transition-all cursor-pointer flex items-center justify-center"
            loading={isSubmitting}
            disabled={googleLoading}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </div>

        {/* Don't have an account */}
        <p className="text-center text-[13.5px] text-slate pt-1">
          Don&apos;t have an account?{" "}
          <Link
            href={`/signup${queryString ? `?${queryString}` : ""}`}
            className="font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            Sign up
          </Link>
        </p>

        {/* OR Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-line/80" />
          </div>
          <span className="relative bg-surface px-3 text-[11px] font-semibold uppercase tracking-wider text-slate/70">
            OR
          </span>
        </div>

        {/* Google OAuth 2.0 Sign In */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || isSubmitting}
            className="flex h-11 sm:h-12 w-full items-center justify-center gap-3 rounded-[10px] border border-line bg-surface px-4 text-[14px] sm:text-[15px] font-medium text-ink transition-all duration-200 hover:bg-mist hover:border-line-strong/60 shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Image
              src="/images/google-logo.png"
              alt="Google logo"
              width={20}
              height={20}
              className="h-5 w-5 object-contain"
            />
            <span>{googleLoading ? "Redirecting to Google…" : "Continue with Google"}</span>
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
