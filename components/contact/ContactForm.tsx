"use client";

import { useId, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { postContact, type ContactInput } from "@/lib/publicApi";

type Kind = "customer" | "freelancer" | "investor";

const KINDS: { value: Kind; label: string; note: string }[] = [
  { value: "customer", label: "Customer", note: "I want Voxlate for me or my team" },
  { value: "freelancer", label: "Freelancer", note: "I work across languages" },
  { value: "investor", label: "Investor", note: "I want to back the idea" },
];

const TOPICS = ["Digital version for online meetings", "Physical version (wearable)", "Partnership or integration", "Something else"];
const STAGES = ["Angel", "Pre-seed", "Seed", "Strategic partnership", "Something else"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function ContactForm() {
  const id = useId();
  const params = useSearchParams();
  const [kind, setKind] = useState<Kind>(params.get("for") === "investor" ? "investor" : "customer");
  const [fields, setFields] = useState({ name: "", email: "", company: "", topic: TOPICS[0], stage: STAGES[0], website: "", message: "", fax: "" });
  const [errors, setErrors] = useState<Partial<Record<"name" | "email" | "message", string>>>({});
  const [state, setState] = useState<{ kind: "idle" | "sending" } | { kind: "sent"; name: string } | { kind: "error"; message: string }>({ kind: "idle" });
  const investor = kind === "investor";

  const set = (key: keyof typeof fields) => (e: { target: { value: string } }) => setFields((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (state.kind === "sending") return;
    const next: typeof errors = {};
    if (!fields.name.trim()) next.name = "Please add your name.";
    if (!EMAIL.test(fields.email.trim())) next.email = "Please enter a valid email so we can reply.";
    if (fields.message.trim().length < 10) next.message = "Please write at least 10 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const common = {
      name: fields.name.trim(),
      email: fields.email.trim(),
      company: fields.company.trim() || undefined,
      website: fields.website.trim() || undefined,
      message: fields.message.trim(),
      fax: fields.fax || undefined,
    };
    const payload: ContactInput = investor ? { kind: "investor", stage: fields.stage, ...common } : { kind, topic: fields.topic, ...common };
    setState({ kind: "sending" });
    try {
      await postContact(payload);
      setState({ kind: "sent", name: common.name.split(/\s+/)[0] });
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "Your message couldn't be sent. Please try again." });
    }
  };

  if (state.kind === "sent") {
    return (
      <div role="status" className="rounded-[14px] border border-line bg-surface p-8 sm:p-10">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white">
          <Check size={20} aria-hidden />
        </span>
        <p className="vx-display mt-6 text-[clamp(1.8rem,4vw,2.4rem)] text-ink">Thanks, {state.name}.</p>
        <p className="mt-3 max-w-[44ch] text-[16px] leading-relaxed text-slate">
          Your message is with the founding team. We reply to every {investor ? "investor note" : "message"} by email, usually within a few working days.
        </p>
        <button
          type="button"
          className="vx-link mt-7"
          onClick={() => {
            setFields((f) => ({ ...f, message: "" }));
            setState({ kind: "idle" });
          }}
        >
          Send another <ArrowRight size={15} aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-7">
      <fieldset>
        <legend className="vx-field-label">I’m reaching out as</legend>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {KINDS.map((k) => (
            <label key={k.value} className="vx-choice">
              <input type="radio" name={`${id}-kind`} value={k.value} checked={kind === k.value} onChange={() => setKind(k.value)} />
              <span className="text-[15px] font-semibold text-ink">{k.label}</span>
              <span className="text-[13px] leading-snug text-slate">{k.note}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${id}-name`} label="Full name" error={errors.name}>
          <input id={`${id}-name`} className="vx-field" value={fields.name} onChange={set("name")} autoComplete="name" maxLength={120} aria-invalid={Boolean(errors.name)} />
        </Field>
        <Field id={`${id}-email`} label="Email" error={errors.email}>
          <input id={`${id}-email`} type="email" className="vx-field" value={fields.email} onChange={set("email")} autoComplete="email" maxLength={254} aria-invalid={Boolean(errors.email)} />
        </Field>
        <Field id={`${id}-company`} label={investor ? "Firm or fund" : "Company"} optional>
          <input id={`${id}-company`} className="vx-field" value={fields.company} onChange={set("company")} autoComplete="organization" maxLength={200} />
        </Field>
        {investor ? (
          <Field id={`${id}-stage`} label="Interested in">
            <select id={`${id}-stage`} className="vx-field" value={fields.stage} onChange={set("stage")}>
              {STAGES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        ) : (
          <Field id={`${id}-topic`} label="It’s about">
            <select id={`${id}-topic`} className="vx-field" value={fields.topic} onChange={set("topic")}>
              {TOPICS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
        )}
      </div>

      {investor && (
        <Field id={`${id}-site`} label="LinkedIn or website" optional>
          <input id={`${id}-site`} type="url" className="vx-field" value={fields.website} onChange={set("website")} placeholder="https://" maxLength={300} />
        </Field>
      )}

      <Field id={`${id}-msg`} label={investor ? "What would you like to discuss?" : "How can we help?"} error={errors.message}>
        <textarea
          id={`${id}-msg`}
          className="vx-field"
          value={fields.message}
          onChange={set("message")}
          maxLength={4000}
          aria-invalid={Boolean(errors.message)}
          placeholder={investor ? "A little about you and what caught your interest." : "Languages you work in, team size, where you'd use it…"}
        />
      </Field>

      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-fax`}>Fax</label>
        <input id={`${id}-fax`} tabIndex={-1} autoComplete="off" value={fields.fax} onChange={set("fax")} />
      </div>

      {state.kind === "error" && (
        <p role="alert" className="text-[14px] text-danger">
          {state.message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="submit" className="vx-btn" disabled={state.kind === "sending"}>
          {state.kind === "sending" ? "Sending…" : investor ? "Send to the founders" : "Send message"}
          <ArrowRight size={17} aria-hidden />
        </button>
        <p className="text-[13px] text-slate">We only use your details to reply.</p>
      </div>
    </form>
  );
}

function Field({ id, label, optional, error, children }: { id: string; label: string; optional?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="vx-field-label">
        {label} {optional && <small>(optional)</small>}
      </label>
      {children}
      {error && <p className="vx-field-error">{error}</p>}
    </div>
  );
}
