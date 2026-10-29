"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { signupUser } from "@/lib/authApi";
import { submitToWaitlist } from "@/lib/waitlistApi";
import { signupSchema, type SignupFormValues } from "@/lib/authValidation";
import { safeRedirect } from "@/lib/safeRedirect";
import { Button } from "@/components/ui/Button";
import { AuthFormError } from "@/components/auth/AuthFormError";
import { AuthShell, AuthStatus } from "@/components/auth/AuthShell";
import { useAuth } from "@/components/auth/AuthProvider";

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const redirectTo = safeRedirect(searchParams.get("redirectTo"));
  const queryString = searchParams.toString();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreedToTerms: false,
      joinWaitlist: true,
      photo: "",
    },
    mode: "onBlur",
  });

  const handleGoogleSignUp = async () => {
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

  async function onSubmit(values: SignupFormValues) {
    setIsSubmitting(true);
    setFormError(null);

    const result = await signupUser({ ...values, photo: values.photo || "" });

    if (result.status === "success") {
      signup({ ...result.data, photoUrl: result.data.photoUrl });

      if (values.joinWaitlist) {
        try {
          await submitToWaitlist({
            name: values.name,
            email: values.email,
            company: "",
            role: "",
            organization: "",
            type: "individual",
            product: "digital",
            source: "signup",
            photo: result.data.photoUrl || "",
          });
        } catch {
          // Non-blocking waitlist failure
        }
      }

      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => router.push(redirectTo), 1500);
    } else if (result.code === "email_taken") {
      setFormError("An account with this email already exists.");
      setIsSubmitting(false);
    } else if (result.code === "server_error") {
      setFormError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    } else {
      setFormError(result.message);
      setIsSubmitting(false);
    }
  }

  if (success) return <AuthStatus title="Account created" message="Redirecting you..." />;

  return (
    <AuthShell
      title="Create Account"
      subtitle="Join Voxlate and be part of the future of communication"
      icon={
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary shadow-xs">
          <Sparkles className="h-6 w-6 text-primary" strokeWidth={2} />
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-busy={isSubmitting || googleLoading} noValidate>
        {formError && <AuthFormError message={formError} />}

        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-[13px] font-medium text-ink mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/70"
              aria-hidden="true"
            />
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="John Doe"
              aria-invalid={errors.name ? true : undefined}
              className="w-full h-11 sm:h-12 rounded-[10px] border border-line bg-surface pl-10 pr-4 text-[14px] sm:text-[15px] text-ink placeholder:text-slate/40 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              {...register("name")}
            />
          </div>
          {errors.name?.message && (
            <p className="mt-1 text-[12px] text-danger">{errors.name.message}</p>
          )}
        </div>

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
              autoComplete="new-password"
              placeholder="Min. 8 characters"
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

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-[13px] font-medium text-ink mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/70"
              aria-hidden="true"
            />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat password"
              aria-invalid={errors.confirmPassword ? true : undefined}
              className="w-full h-11 sm:h-12 rounded-[10px] border border-line bg-surface pl-10 pr-11 text-[14px] sm:text-[15px] text-ink placeholder:text-slate/40 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate/70 hover:text-ink transition-colors cursor-pointer rounded-md"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
            </button>
          </div>
          {errors.confirmPassword?.message && (
            <p className="mt-1 text-[12px] text-danger">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms Agreement Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none text-[13px] text-slate hover:text-ink transition-colors">
            <input
              id="agreedToTerms"
              type="checkbox"
              aria-invalid={errors.agreedToTerms ? true : undefined}
              className="mt-0.5 h-4 w-4 rounded border-line text-primary focus:ring-primary/30 accent-primary cursor-pointer shrink-0"
              {...register("agreedToTerms")}
            />
            <span className="leading-snug">
              I agree to the{" "}
              <Link href="/terms" target="_blank" className="text-primary hover:text-primary-hover font-medium underline underline-offset-2">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="text-primary hover:text-primary-hover font-medium underline underline-offset-2">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.agreedToTerms?.message && (
            <p className="mt-1 text-[12px] text-danger">{errors.agreedToTerms.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            className="w-full h-11 sm:h-12 rounded-[10px] bg-primary hover:bg-primary-hover text-white text-[15px] font-medium shadow-xs transition-all cursor-pointer flex items-center justify-center"
            loading={isSubmitting}
            disabled={googleLoading}
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </div>

        {/* Already have an account */}
        <p className="text-center text-[13.5px] text-slate pt-1">
          Already have an account?{" "}
          <Link
            href={`/login${queryString ? `?${queryString}` : ""}`}
            className="font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            Sign in
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
            onClick={handleGoogleSignUp}
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
