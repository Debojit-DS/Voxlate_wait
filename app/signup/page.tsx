"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, ArrowLeft } from "lucide-react";
import { signupUser } from "@/lib/authApi";
import { uploadPhoto } from "@/lib/uploadApi";
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
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [redirectTo, setRedirectTo] = useState("/");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRedirect = params.get("redirectTo");
    const storedRedirect = sessionStorage.getItem("redirectTo");
    setRedirectTo(urlRedirect || storedRedirect || "/");
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", agreedToTerms: false, photo: "" },
    mode: "onBlur",
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoPreview(null);
      setValue("photo", "");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFormError("Please select an image file.");
      setPhotoPreview(null);
      setValue("photo", "");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFormError("Image must be less than 10MB.");
      setPhotoPreview(null);
      setValue("photo", "");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setValue("photo", result);
      setFormError(null);
    };
    reader.readAsDataURL(file);
  };

  async function onSubmit(values: SignupFormValues) {
    setIsSubmitting(true);
    setFormError(null);

    let photoUrl = values.photo || "";
    if (photoUrl && photoUrl.startsWith("data:image/")) {
      const uploaded = await uploadPhoto(photoUrl);
      if (!uploaded) {
        setFormError("Failed to upload photo. Please try again.");
        setIsSubmitting(false);
        return;
      }
      photoUrl = uploaded.url;
    }

    const result = await signupUser({ ...values, photo: photoUrl });
    setIsSubmitting(false);

    if (result.status === "success") {
      signup({ ...result.data, photoUrl: result.data.photoUrl });
      setSuccess(true);
      sessionStorage.removeItem("redirectTo");
      sessionStorage.removeItem("autoOpen");
      setTimeout(() => router.push(redirectTo), 1500);
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

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Hiding that cute smile should be illegal 😌 Come on, let the world see it—add a profile photo! 👀✨</label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 rounded-full border border-border bg-bg-surface-alt overflow-hidden flex items-center justify-center">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <User className="text-text-muted" size={24} />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-input file:border-0 file:text-sm file:font-medium file:bg-bg-surface-alt file:text-text-primary hover:file:bg-border"
                    />
                    {errors.photo && <p className="text-danger mt-1 text-sm">{errors.photo.message}</p>}
                    <p className="text-xs text-text-muted mt-1">Max 10MB. JPG, PNG, or WebP.</p>
                  </div>
                </div>
              </div>

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




