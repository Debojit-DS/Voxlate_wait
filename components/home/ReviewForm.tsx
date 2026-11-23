"use client";

import { useId, useState, type FormEvent } from "react";
import { Star } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/components/auth/AuthProvider";
import { postReview, type PublicReview } from "@/lib/publicApi";

const MAX = 1000;

export function ReviewForm({ open, onClose, onPosted }: { open: boolean; onClose: () => void; onPosted: (review: PublicReview) => void }) {
  const { user } = useAuth();
  const id = useId();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [state, setState] = useState<{ kind: "idle" | "sending" | "done" } | { kind: "error"; message: string }>({ kind: "idle" });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (state.kind === "sending") return;
    const authorName = user?.name || name.trim();
    if (!authorName) return setState({ kind: "error", message: "Please add your name." });
    if (!text.trim()) return setState({ kind: "error", message: "Please write a few words about your experience." });
    setState({ kind: "sending" });
    try {
      const review = await postReview({ text: text.trim(), rating, authorName });
      onPosted(review);
      setState({ kind: "done" });
      setText("");
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "Your review couldn't be saved. Please try again." });
    }
  };

  const close = () => {
    onClose();
    if (state.kind !== "sending") setState({ kind: "idle" });
  };

  return (
    <Modal open={open} onClose={close} title="Share your experience" description="Tried the Voxlate demo? Tell others how it went.">
      {state.kind === "done" ? (
        <div className="space-y-5">
          <p className="text-[16px] leading-relaxed text-ink">Thank you. Your review is now on the loop.</p>
          <button type="button" className="vx-btn vx-btn-sm" onClick={close}>
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5" noValidate>
          {!user && (
            <div>
              <label htmlFor={`${id}-name`} className="field-label">
                Your name
              </label>
              <input id={`${id}-name`} className="field" value={name} maxLength={120} autoComplete="name" onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <fieldset>
            <legend className="field-label">Rating</legend>
            <div className="flex gap-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  onClick={() => setRating(n)}
                  className="flex h-10 w-10 items-center justify-center rounded-[8px] transition-colors hover:bg-mist"
                >
                  <Star size={22} className={n <= rating ? "fill-primary text-primary" : "text-line-strong"} aria-hidden />
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor={`${id}-text`} className="field-label">
              Your review
            </label>
            <textarea
              id={`${id}-text`}
              className="field min-h-[132px] resize-y"
              value={text}
              maxLength={MAX}
              onChange={(e) => setText(e.target.value)}
              placeholder="What did you try, and how did it sound?"
            />
            <p className="field-hint text-right tabular-nums">
              {text.length}/{MAX}
            </p>
          </div>
          {state.kind === "error" && (
            <p role="alert" className="field-error">
              {state.message}
            </p>
          )}
          <button type="submit" className="vx-btn vx-btn-sm" disabled={state.kind === "sending"}>
            {state.kind === "sending" ? "Posting…" : "Post review"}
          </button>
        </form>
      )}
    </Modal>
  );
}
