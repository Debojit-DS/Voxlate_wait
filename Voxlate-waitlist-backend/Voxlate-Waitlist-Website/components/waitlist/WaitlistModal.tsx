"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, User, Mail, Building2, CheckCircle2, Briefcase, Upload } from "lucide-react";
import { submitToWaitlist } from "@/lib/waitlistApi";
import { waitlistSchema, type WaitlistFormValues } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useWaitlistModal } from "@/components/waitlist/WaitlistModalProvider";
import { useAuth } from "@/components/auth/AuthProvider";

function WaitlistForm() {
  const { closeModal } = useWaitlistModal();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      company: "",
      type: "individual",
      product: "digital",
      source: "",
      role: "",
      organization: "",
      photo: "",
    } as WaitlistFormValues,
    mode: "onBlur",
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoError(null);

    if (!file) {
      setPhotoPreview(null);
      setValue("photo", "");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select a valid image file.");
      setPhotoPreview(null);
      setValue("photo", "");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPhotoError("Image must be less than 10MB.");
      setPhotoPreview(null);
      setValue("photo", "");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setValue("photo", result);
    };
    reader.readAsDataURL(file);
  };

  async function onSubmit(values: WaitlistFormValues) {
    setIsSubmitting(true);
    setFormError(null);
    const result = await submitToWaitlist(values);
    setIsSubmitting(false);

    if (result.status === "success") {
      setSuccess(true);
      setResultMessage(result.message);
    } else if (result.code === "duplicate_email") {
      setSuccess(true);
      setResultMessage("Looks like you're already on the waitlist with this email!");
    } else if (result.code === "validation_error") {
      setFormError(result.message || "Please check your inputs and try again.");
    } else {
      setFormError(result.message || "Something went wrong. Please try again.");
    }
  }

  if (success) {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="mx-auto text-success mb-4" size={48} />
        <h3 className="text-2xl font-bold text-text-primary mb-2">You&apos;re on the list!</h3>
        <p className="text-text-secondary text-sm mb-6">{resultMessage}</p>
        <Button variant="primary-orange" onClick={closeModal} className="w-full">
          Done
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {formError && (
        <div className="rounded-input border border-danger bg-danger/5 px-4 py-3 text-sm text-danger">
          {formError}
        </div>
      )}

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

      <Input
        id="company"
        label="Company Name (optional)"
        placeholder="Company Name (optional)"
        registration={register("company")}
        error={errors.company?.message}
        icon={Building2}
      />

      <Input
        id="role"
        label="Your Role / Title (optional)"
        placeholder="Your Role / Title (optional)"
        registration={register("role")}
        error={errors.role?.message}
        icon={Briefcase}
      />

      <Input
        id="organization"
        label="Organization / Institution (optional)"
        placeholder="Organization / Institution (optional)"
        registration={register("organization")}
        error={errors.organization?.message}
        icon={Building2}
      />

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">Profile Photo (optional)</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border rounded-input cursor-pointer flex items-center justify-center gap-3 h-32 bg-bg-surface-alt transition-colors ${
            photoError ? "border-danger" : "border-border hover:border-orange"
          }`}
        >
          {photoPreview ? (
            <img src={photoPreview} alt="Preview" className="h-full w-full object-cover rounded-input" />
          ) : (
            <>
              <Upload className="text-text-muted" size={24} />
              <span className="text-sm text-text-secondary">Click to upload a photo (max 2MB)</span>
            </>
          )}
        </div>
        {photoError && <p className="text-danger mt-1 text-sm">{photoError}</p>}
        {errors.photo && <p className="text-danger mt-1 text-sm">{errors.photo.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">I&apos;m signing up as</label>
        <div className="grid grid-cols-2 gap-3">
          <label className="cursor-pointer">
            <input type="radio" value="individual" {...register("type")} className="sr-only peer" />
            <div className="rounded-input border border-border px-4 py-2.5 text-center text-sm font-bold text-text-primary peer-checked:border-orange peer-checked:bg-orange peer-checked:text-white transition-colors">
              Individual
            </div>
          </label>
          <label className="cursor-pointer">
            <input type="radio" value="business" {...register("type")} className="sr-only peer" />
            <div className="rounded-input border border-border px-4 py-2.5 text-center text-sm font-bold text-text-primary peer-checked:border-orange peer-checked:bg-orange peer-checked:text-white transition-colors">
              Business
            </div>
          </label>
        </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">I&apos;m waitlisting for</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <label className="cursor-pointer">
              <input type="radio" value="digital" {...register("product")} className="sr-only peer" />
              <div className="rounded-input border border-border px-4 py-2.5 text-center text-sm font-bold text-text-primary peer-checked:border-orange peer-checked:bg-orange peer-checked:text-white transition-colors">
                Digital version
              </div>
            </label>
            <label className="cursor-pointer">
              <input type="radio" value="physical" {...register("product")} className="sr-only peer" />
              <div className="rounded-input border border-border px-4 py-2.5 text-center text-sm font-bold text-text-primary peer-checked:border-orange peer-checked:bg-orange peer-checked:text-white transition-colors whitespace-nowrap">
                Physical version
              </div>
            </label>
            <label className="cursor-pointer">
              <input type="radio" value="both" {...register("product")} className="sr-only peer" />
              <div className="rounded-input border border-border px-4 py-2.5 text-center text-sm font-bold text-text-primary peer-checked:border-orange peer-checked:bg-orange peer-checked:text-white transition-colors whitespace-nowrap">
                Both
              </div>
            </label>
          </div>
          {errors.product && <p className="text-danger mt-1 text-sm">{errors.product.message}</p>}
        </div>

        <Button variant="primary-orange" type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Joining..." : "Join Waitlist"}
      </Button>
    </form>
  );
}

export function WaitlistModal() {
  const { isOpen, closeModal } = useWaitlistModal();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-cta/50" onClick={closeModal} />
      <div className="relative z-10 w-full max-w-[480px] rounded-modal bg-accent-blue-light p-8 shadow-lg border border-border">
        <button
          type="button"
          onClick={closeModal}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h3 className="text-2xl font-bold text-text-primary">Join the Voxlate Waitlist</h3>
          <p className="mt-2 text-sm font-semibold text-text-primary">Be first in line. Get notified the moment Voxlate launches.</p>
        </div>

        <WaitlistForm />
      </div>
    </div>
  );
}




