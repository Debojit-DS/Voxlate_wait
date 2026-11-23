"use client";

import { useId, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { ArrowRight, Check, FileText, Upload, X } from "lucide-react";

const ROLES = [
  "Tech (Full-Stack / Backend / Frontend)",
  "AI / ML (Speech, LLMs, Computer Vision)",
  "Cybersecurity",
  "Hardware & Embedded Systems",
  "Marketing & Growth",
  "Sales & Business Development",
  "UI / UX Design",
  "Other",
];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Postgraduate / Alum", "Other"];

type Fields = {
  fullName: string;
  email: string;
  phone: string;
  college: string;
  year: string;
  role: string;
  skills: string;
  motivation: string;
  project: string;
  ideas: string;
  differentiator: string;
  links: string;
};
const EMPTY: Fields = { fullName: "", email: "", phone: "", college: "", year: "", role: "", skills: "", motivation: "", project: "", ideas: "", differentiator: "", links: "" };
const REQUIRED: (keyof Fields)[] = ["fullName", "email", "phone", "college", "year", "role", "skills", "motivation", "ideas", "differentiator"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Application form: same questions and endpoints as before, no waitlist gate. */
export function CareersForm() {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [resume, setResume] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields | "resume", string>>>({});
  const [state, setState] = useState<{ kind: "idle" | "sending" | "sent" } | { kind: "error"; message: string }>({ kind: "idle" });

  const set = (key: keyof Fields) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  const pickResume = (file: File | undefined) => {
    if (!file) return;
    if (file.type !== "application/pdf") return setErrors((e) => ({ ...e, resume: "Please upload a PDF." }));
    if (file.size > 10 * 1024 * 1024) return setErrors((e) => ({ ...e, resume: "The PDF must be under 10 MB." }));
    setErrors((e) => ({ ...e, resume: undefined }));
    setResume(file);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (state.kind === "sending") return;
    const next: typeof errors = {};
    for (const key of REQUIRED) if (!fields[key].trim()) next[key] = "This one is required.";
    if (fields.email && !EMAIL.test(fields.email.trim())) next.email = "Please enter a valid email.";
    if (!resume) next.resume = "Please attach your resume (PDF).";
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(`${id}-${Object.keys(next)[0]}`)?.focus();
      return;
    }

    setState({ kind: "sending" });
    try {
      const upload = new FormData();
      upload.append("resume", resume as File);
      const up = await fetch("/api/upload/resume", { method: "POST", body: upload, signal: AbortSignal.timeout(30_000) });
      const upData = await up.json().catch(() => ({}));
      if (!up.ok || !upData.data?.url) throw new Error(upData.message || "Your resume couldn't be uploaded. Please try again.");

      const res = await fetch("/api/careers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(30_000),
        body: JSON.stringify({
          fullName: fields.fullName.trim(),
          email: fields.email.trim(),
          contactNumber: fields.phone.trim(),
          college: fields.college.trim(),
          currentYear: fields.year,
          roleAppliedFor: fields.role,
          strongestSkills: fields.skills.trim(),
          motivation: fields.motivation.trim(),
          projectDetails: fields.project.trim() || null,
          proposedIdea: fields.ideas.trim(),
          uniqueEdge: fields.differentiator.trim(),
          portfolioLinks: fields.links.trim() || null,
          resumeUrl: upData.data.url,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Your application couldn't be sent. Please try again.");
      setState({ kind: "sent" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "Something went wrong. Please try again." });
    }
  };

  if (state.kind === "sent") {
    return (
      <div role="status" className="rounded-[14px] border border-line bg-surface p-8 sm:p-10">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white">
          <Check size={20} aria-hidden />
        </span>
        <p className="vx-display mt-6 text-[clamp(1.8rem,4vw,2.6rem)] text-ink">Application received.</p>
        <p className="mt-3 max-w-[46ch] text-[16px] leading-relaxed text-slate">
          Thanks for wanting to build Voxlate with us. We read every application and will reach out by email or phone.
        </p>
      </div>
    );
  }

  const field = (key: keyof Fields) => ({ id: `${id}-${key}`, value: fields[key], onChange: set(key), "aria-invalid": Boolean(errors[key]) });

  return (
    <form onSubmit={submit} noValidate className="space-y-14">
      <Section n="01" title="About you">
        <Field label="Full name" error={errors.fullName} htmlFor={`${id}-fullName`}>
          <input className="vx-field" autoComplete="name" maxLength={120} {...field("fullName")} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" error={errors.email} htmlFor={`${id}-email`}>
            <input className="vx-field" type="email" autoComplete="email" maxLength={254} {...field("email")} />
          </Field>
          <Field label="Phone" error={errors.phone} htmlFor={`${id}-phone`}>
            <input className="vx-field" type="tel" autoComplete="tel" maxLength={50} {...field("phone")} />
          </Field>
          <Field label="College or university" error={errors.college} htmlFor={`${id}-college`}>
            <input className="vx-field" autoComplete="organization" maxLength={250} {...field("college")} />
          </Field>
          <Field label="Current year" error={errors.year} htmlFor={`${id}-year`}>
            <select className="vx-field" {...field("year")}>
              <option value="">Choose…</option>
              {YEARS.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section n="02" title="The role">
        <fieldset>
          <legend className="vx-field-label">Which role are you applying for?</legend>
          <div className="grid gap-2.5 sm:grid-cols-2" id={`${id}-role`} tabIndex={-1}>
            {ROLES.map((r) => (
              <label key={r} className="vx-choice">
                <input type="radio" name={`${id}-role-choice`} value={r} checked={fields.role === r} onChange={set("role")} />
                <span className="text-[15px] font-medium text-ink">{r}</span>
              </label>
            ))}
          </div>
          {errors.role && <p className="vx-field-error">{errors.role}</p>}
        </fieldset>
        <Field label="What are your strongest skills?" error={errors.skills} htmlFor={`${id}-skills`}>
          <textarea className="vx-field !min-h-[100px]" maxLength={10000} placeholder="Python, Next.js, hardware prototyping, growth, pitching…" {...field("skills")} />
        </Field>
      </Section>

      <Section n="03" title="You and Voxlate">
        <Field label="Why Voxlate, and what interests you about this role?" error={errors.motivation} htmlFor={`${id}-motivation`}>
          <textarea className="vx-field" maxLength={10000} {...field("motivation")} />
        </Field>
        <Field label="A project, achievement or initiative you’re proud of" optional hint="Technical depth, links, numbers or personal impact all help." htmlFor={`${id}-project`}>
          <textarea className="vx-field" maxLength={10000} {...field("project")} />
        </Field>
        <Field label="One idea or improvement you’d bring to Voxlate" error={errors.ideas} htmlFor={`${id}-ideas`}>
          <textarea className="vx-field" maxLength={10000} placeholder="A feature, an optimisation, a marketing idea, a better way of working…" {...field("ideas")} />
        </Field>
        <Field label="What makes you different, and why should we choose you?" error={errors.differentiator} htmlFor={`${id}-differentiator`}>
          <textarea className="vx-field" maxLength={10000} {...field("differentiator")} />
        </Field>
      </Section>

      <Section n="04" title="Resume and links">
        <div>
          <span className="vx-field-label">Resume (PDF, up to 10 MB)</span>
          <input
            ref={fileRef}
            id={`${id}-resume`}
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={(e) => pickResume(e.target.files?.[0])}
          />
          {resume ? (
            <div className="flex items-center gap-3 rounded-[10px] border border-line bg-surface px-4 py-3">
              <FileText size={20} className="shrink-0 text-primary" aria-hidden />
              <span className="min-w-0 flex-1 truncate text-[15px] text-ink">{resume.name}</span>
              <button
                type="button"
                onClick={() => {
                  setResume(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="flex h-8 w-8 items-center justify-center rounded-[8px] text-slate hover:bg-mist hover:text-ink"
                aria-label="Remove resume"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label
              htmlFor={`${id}-resume`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                pickResume(e.dataTransfer.files?.[0]);
              }}
              className="flex cursor-pointer flex-col items-start gap-1 rounded-[10px] border border-dashed border-line-strong bg-surface px-5 py-6 transition-colors hover:border-primary hover:bg-white"
            >
              <span className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                <Upload size={17} aria-hidden /> Choose a PDF or drop it here
              </span>
              <span className="text-[13px] text-slate">We only use it to review your application.</span>
            </label>
          )}
          {errors.resume && <p className="vx-field-error">{errors.resume}</p>}
        </div>
        <Field label="Portfolio, GitHub or LinkedIn" optional htmlFor={`${id}-links`}>
          <input className="vx-field" maxLength={2000} placeholder="https://github.com/…  https://linkedin.com/in/…" {...field("links")} />
        </Field>
      </Section>

      {state.kind === "error" && (
        <p role="alert" className="text-[15px] text-danger">
          {state.message}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-8">
        <button type="submit" className="vx-btn" disabled={state.kind === "sending"}>
          {state.kind === "sending" ? "Sending your application…" : "Send application"}
          <ArrowRight size={17} aria-hidden />
        </button>
        <p className="text-[13px] text-slate">Takes about 10 minutes. Nothing is shared outside the team.</p>
      </div>
    </form>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-line pt-8 md:grid-cols-[180px_1fr] md:gap-10">
      <h2 className="flex items-baseline gap-3 md:block">
        <span className="vx-label text-primary">{n}</span>
        <span className="vx-display text-[24px] text-ink md:mt-2 md:block">{title}</span>
      </h2>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Field({ label, htmlFor, optional, hint, error, children }: { label: string; htmlFor: string; optional?: boolean; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="vx-field-label">
        {label} {optional && <small>(optional)</small>}
      </label>
      {hint && <p className="-mt-1 mb-2 text-[13px] text-slate">{hint}</p>}
      {children}
      {error && <p className="vx-field-error">{error}</p>}
    </div>
  );
}
