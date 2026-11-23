"use client";

import { useId, useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { postQuestion } from "@/lib/publicApi";

const MAX = 1000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** "Didn't find yours?" — sends the question to the backend (POST /api/questions). */
export function AskQuestion() {
  const id = useId();
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot, hidden from people
  const [errors, setErrors] = useState<Partial<Record<"question" | "name" | "email", string>>>({});
  const [state, setState] = useState<{ kind: "idle" | "sending" } | { kind: "sent"; name: string; email: string } | { kind: "error"; message: string }>({
    kind: "idle",
  });

  const nameValue = name || user?.name || "";
  const emailValue = email || user?.email || "";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (state.kind === "sending") return;
    const next: typeof errors = {};
    if (question.trim().length < 10) next.question = "Please write at least 10 characters.";
    if (!nameValue.trim()) next.name = "Please add your name.";
    if (!EMAIL.test(emailValue.trim())) next.email = "Please enter a valid email so we can reply.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setState({ kind: "sending" });
    try {
      await postQuestion({ question: question.trim(), name: nameValue.trim(), email: emailValue.trim(), website });
      setState({ kind: "sent", name: nameValue.trim().split(/\s+/)[0], email: emailValue.trim() });
      setQuestion("");
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "Your question couldn't be sent. Please try again." });
    }
  };

  return (
    <div id="ask" className="page-container mt-20 pb-24 lg:mt-28 lg:pb-32">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <h3 className="vx-display text-[clamp(2rem,5vw,3.25rem)] text-ink">
            Didn’t find yours?
            <br />
            <span className="text-primary">Ask us.</span>
          </h3>
          <p className="mt-4 max-w-[36ch] text-[16px] leading-relaxed text-slate">
            A person from the team reads every question and replies by email.
          </p>
        </div>

        {state.kind === "sent" ? (
          <div role="status" className="self-center border-l-2 border-primary pl-6">
            <p className="text-[20px] font-semibold text-ink">Thanks, {state.name}. We’ve got your question.</p>
            <p className="mt-2 text-[16px] text-slate">We’ll reply to {state.email}.</p>
            <button type="button" className="vx-link mt-5" onClick={() => setState({ kind: "idle" })}>
              Ask another <ArrowRight size={15} aria-hidden />
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-6">
            <div>
              <label htmlFor={`${id}-q`} className="sr-only">
                Your question
              </label>
              <textarea
                id={`${id}-q`}
                value={question}
                maxLength={MAX}
                rows={3}
                onChange={(e) => setQuestion(e.target.value)}
                aria-invalid={Boolean(errors.question)}
                aria-describedby={errors.question ? `${id}-q-err` : undefined}
                placeholder="Type your question…"
                className="w-full resize-none border-0 border-b-2 border-ink bg-transparent pb-3 text-[clamp(1.25rem,2.4vw,1.75rem)] leading-snug text-ink placeholder:text-line-strong focus:border-primary focus:outline-none"
                style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
              />
              <div className="mt-1.5 flex justify-between text-[13px]">
                <span id={`${id}-q-err`} className="text-danger">
                  {errors.question}
                </span>
                <span className="tabular-nums text-slate">
                  {question.length}/{MAX}
                </span>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id={`${id}-n`} label="Name" value={nameValue} onChange={setName} error={errors.name} autoComplete="name" />
              <Field id={`${id}-e`} label="Email" type="email" value={emailValue} onChange={setEmail} error={errors.email} autoComplete="email" />
            </div>
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor={`${id}-w`}>Website</label>
              <input id={`${id}-w`} tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
            {state.kind === "error" && (
              <p role="alert" className="text-[14px] text-danger">
                {state.message}
              </p>
            )}
            <button type="submit" className="vx-btn" disabled={state.kind === "sending"}>
              {state.kind === "sending" ? "Sending…" : "Send question"}
              <ArrowRight size={17} aria-hidden />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-[13px] font-medium text-slate">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        maxLength={type === "email" ? 254 : 80}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : undefined}
        className="mt-1 block h-11 w-full border-0 border-b border-line-strong bg-transparent text-[17px] text-ink focus:border-primary focus:outline-none"
      />
      {error && (
        <p id={`${id}-err`} className="mt-1 text-[13px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
