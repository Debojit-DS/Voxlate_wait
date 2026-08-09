"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, ArrowLeft } from "lucide-react";
import { signupUser } from "@/lib/authApi";
import { signupSchema, type SignupFormValues } from "@/lib/authValidation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SocialAuthButton } from "@/components/auth/SocialAuthButton";
import { AuthFormError } from "@/components/auth/AuthFormError";
import { Footer } from "@/components/layout/Footer";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", agreedToTerms: false },
    mode: "onBlur",
  });

  async function onSubmit(values: SignupFormValues) {
    setIsSubmitting(true);
    setFormError(null);
    const result = await signupUser(values);
    setIsSubmitting(false);

    if (result.status === "success") {
      signup(result.data);
      setSuccess(true);
      setTimeout(() => router.push("/"), 1500);
    } else if (result.code === "email_taken") {
      setFormError("An account with this email already exists.");
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
            <h2 className="text-2xl font-bold text-text-primary">Account created</h2>
            <p className="mt-2 text-text-secondary text-sm">Redirecting you to the homepage...</p>
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
              <h1 className="text-2xl font-bold text-text-primary">Create Your Account</h1>
              <p className="mt-2 text-text-secondary text-sm">Join Voxlate and be part of the future of communication.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" aria-busy={isSubmitting}>
              {formError && <AuthFormError message={formError} />}

              <Input
                id="name"
                label="Full Name"
                placeholder="Full Name"
                registration={register("name")}
                error={errors.name?.message}
                icon={User}
              />

              <Input
                id="email"
                label="Email Address"
                placeholder="Email Address"
                registration={register("email")}
                error={errors.email?.message}
                icon={Mail}
              />

              <PasswordInput
                id="password"
                label="Password"
                placeholder="Password"
                registration={register("password")}
                error={errors.password?.message}
              />

              <PasswordInput
                id="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm Password"
                registration={register("confirmPassword")}
                error={errors.confirmPassword?.message}
              />

              <div className="flex items-center gap-3">
                <input
                  id="agreedToTerms"
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-orange focus:ring-orange"
                  {...register("agreedToTerms")}
                />
                <label htmlFor="agreedToTerms" className="text-sm text-text-secondary">
                  I agree to the{" "}
                  <a href="/terms" className="text-orange hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/terms" className="text-orange hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {errors.agreedToTerms && <p className="text-danger text-sm">{errors.agreedToTerms.message}</p>}

              <Button variant="primary-navy" type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-surface px-4 text-text-muted">OR</span>
                </div>
              </div>

              <SocialAuthButton onSuccess={() => {}} />

              <p className="text-center text-sm text-text-secondary mt-6">
                Already have an account?{" "}
                <Link href="/login" className="text-orange font-semibold hover:underline">
                  Log in
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




