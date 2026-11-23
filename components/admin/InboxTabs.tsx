"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ChevronDown, Star, Trash2 } from "lucide-react";

type Page<T> = { data: T[]; pagination: { page: number; totalPages: number; total: number } };

type Review = { id: string; authorName: string; userEmail: string | null; text: string; rating: number; createdAt: string };
type Question = {
  id: string;
  name: string;
  email: string;
  question: string;
  status?: string;
  answer?: string | null;
  answeredAt?: string | null;
  published?: boolean;
  createdAt: string;
};
type Contact = {
  id: string;
  kind: string;
  name: string;
  email: string;
  company: string | null;
  topic: string | null;
  stage: string | null;
  website: string | null;
  message: string;
  createdAt: string;
};

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** Paged admin list with expandable rows. */
function useAdminList<T>(url: string) {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Page<T> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const sep = url.includes("?") ? "&" : "?";
    fetch(`${url}${sep}page=${page}&pageSize=20`, { signal: controller.signal, cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json.status !== "success") throw new Error(json.message || "Couldn't load.");
        setResult({ data: json.data, pagination: json.pagination });
        setError(null);
      })
      .catch((e: unknown) => {
        if ((e as Error).name !== "AbortError") setError((e as Error).message || "Couldn't load.");
      });
    return () => controller.abort();
  }, [url, page, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { page, setPage, result, error, reload };
}

function Shell({ title, count, actions, children }: { title: string; count?: number; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-[10px] border border-line bg-surface">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="text-[16px] font-semibold text-ink">
          {title} {count !== undefined && <span className="font-normal text-slate">· {count}</span>}
        </h2>
        {actions}
      </header>
      {children}
    </section>
  );
}

function Row({
  summary,
  children,
  onDelete,
  open: controlledOpen,
  onToggle,
}: {
  summary: ReactNode;
  children: ReactNode;
  onDelete?: () => void;
  open?: boolean;
  onToggle?: () => void;
}) {
  const [ownOpen, setOwnOpen] = useState(false);
  const open = controlledOpen ?? ownOpen;
  const setOpen = (fn: (o: boolean) => boolean) => (onToggle ? onToggle() : setOwnOpen(fn));
  return (
    <li className="border-b border-line last:border-0">
      <div className="flex items-start gap-3 px-5 py-3.5">
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex min-w-0 flex-1 items-start gap-3 text-left" aria-expanded={open}>
          <ChevronDown size={16} className={`mt-1 shrink-0 text-slate transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
          <span className="min-w-0 flex-1">{summary}</span>
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={() => window.confirm("Delete this permanently? This can't be undone.") && onDelete()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-slate hover:bg-danger-tint hover:text-danger"
            aria-label="Delete"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
      {open && <div className="px-12 pb-5 text-[14px] leading-relaxed text-ink">{children}</div>}
    </li>
  );
}

function Pager({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-3 border-t border-line px-5 py-3 text-[13px] text-slate">
      <button type="button" className="vx-chip !h-8" disabled={page <= 1} onClick={() => setPage(page - 1)}>
        Previous
      </button>
      <span className="tabular-nums">
        {page} / {totalPages}
      </span>
      <button type="button" className="vx-chip !h-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
        Next
      </button>
    </div>
  );
}

function Status({ error, empty }: { error: string | null; empty: boolean }) {
  if (error) return <p className="px-5 py-8 text-[14px] text-danger">{error}</p>;
  if (empty) return <p className="px-5 py-8 text-[14px] text-slate">Nothing here yet.</p>;
  return null;
}

async function remove(url: string, reload: () => void) {
  const res = await fetch(url, { method: "DELETE" });
  if (res.ok) reload();
  else window.alert("Couldn't delete it. Please try again.");
}

export function ReviewsTab() {
  const { page, setPage, result, error, reload } = useAdminList<Review>("/api/admin/reviews");
  return (
    <Shell title="Reviews" count={result?.pagination.total}>
      <Status error={error} empty={result?.data.length === 0} />
      <ul>
        {result?.data.map((r) => (
          <Row
            key={r.id}
            onDelete={() => remove(`/api/admin/reviews?id=${r.id}`, reload)}
            summary={
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-medium text-ink">{r.authorName}</span>
                <span className="flex gap-0.5" aria-label={`${r.rating} of 5`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={12} className={n <= r.rating ? "fill-primary text-primary" : "text-line"} aria-hidden />
                  ))}
                </span>
                <span className="w-full truncate text-[14px] text-slate">{r.text}</span>
              </span>
            }
          >
            <p className="whitespace-pre-wrap">{r.text}</p>
            <p className="mt-3 text-[13px] text-slate">
              {r.userEmail ?? "No account email"} · {when(r.createdAt)}
            </p>
          </Row>
        ))}
      </ul>
      {result && <Pager page={page} totalPages={result.pagination.totalPages} setPage={setPage} />}
    </Shell>
  );
}

const QUESTION_FILTERS = [
  { value: "open", label: "Waiting" },
  { value: "answered", label: "Answered" },
  { value: "", label: "All" },
];

export function QuestionsTab({ onChange }: { onChange?: () => void }) {
  const [status, setStatus] = useState("open");
  const { page, setPage, result, error, reload } = useAdminList<Question>(`/api/admin/questions${status ? `?status=${status}` : ""}`);
  const changed = () => {
    reload();
    onChange?.();
  };
  return (
    <Shell
      title={status === "open" ? "Waiting for an answer" : status === "answered" ? "Answered" : "All questions"}
      count={result?.pagination.total}
      actions={
        <div className="flex flex-wrap gap-1.5">
          {QUESTION_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className="vx-chip !h-8 !px-3 !text-[13px]"
              aria-pressed={status === f.value}
              onClick={() => {
                setStatus(f.value);
                setPage(1);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      }
    >
      <Status error={error} empty={result?.data.length === 0} />
      <ul>
        {result?.data.map((q) => (
          <QuestionRow key={q.id} q={q} onChanged={changed} />
        ))}
      </ul>
      {result && <Pager page={page} totalPages={result.pagination.totalPages} setPage={setPage} />}
    </Shell>
  );
}

/** One question: read it, answer it, decide whether it goes on the website, and optionally email the answer. */
function QuestionRow({ q, onChanged }: { q: Question; onChanged: () => void }) {
  const answered = q.status === "answered" && Boolean(q.answer);
  const [open, setOpen] = useState(!answered);
  const [wording, setWording] = useState(q.question);
  const [answer, setAnswer] = useState(q.answer ?? "");
  const [publish, setPublish] = useState(answered ? Boolean(q.published) : true);
  const [notify, setNotify] = useState(!answered);
  const [state, setState] = useState<{ kind: "idle" | "saving" } | { kind: "saved"; text: string } | { kind: "error"; text: string }>({ kind: "idle" });

  const save = async () => {
    if (answer.trim().length < 2) return setState({ kind: "error", text: "Write an answer first." });
    setState({ kind: "saving" });
    try {
      const res = await fetch("/api/admin/questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: q.id,
          answer: answer.trim(),
          publish,
          notify,
          question: wording.trim() !== q.question ? wording.trim() : undefined,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.status !== "success") throw new Error(json?.message || "Couldn't save the answer.");
      const bits = [publish ? "Live on the homepage FAQ" : "Saved, not on the website"];
      if (notify) bits.push(json.emailed ? `emailed to ${q.email}` : "email not sent (email isn't set up on the server)");
      setState({ kind: "saved", text: bits.join(" · ") });
      setTimeout(onChanged, 1200);
    } catch (e) {
      setState({ kind: "error", text: (e as Error).message });
    }
  };

  const unpublish = async () => {
    const res = await fetch(`/api/admin/questions?id=${q.id}&unpublish=1`, { method: "DELETE" });
    if (res.ok) onChanged();
  };

  return (
    <Row
      open={open}
      onToggle={() => setOpen((o) => !o)}
      onDelete={() => remove(`/api/admin/questions?id=${q.id}`, onChanged)}
      summary={
        <span className="block">
          <span className="flex flex-wrap items-center gap-2">
            <span className={`rounded-[6px] px-1.5 py-0.5 text-[12px] font-medium ${answered ? (q.published ? "bg-primary text-white" : "bg-mist text-ink") : "bg-ink text-white"}`}>
              {answered ? (q.published ? "On the FAQ" : "Answered") : "Waiting"}
            </span>
            <span className="font-medium text-ink">{q.name}</span>
            <span className="text-[13px] text-slate">{when(q.createdAt)}</span>
          </span>
          <span className="mt-1 block truncate text-[15px] text-ink">{q.question}</span>
        </span>
      }
    >
      <div className="space-y-5">
        <div>
          <p className="text-[13px] text-slate">
            From {q.name} ·{" "}
            <a className="text-primary underline" href={`mailto:${q.email}`}>
              {q.email}
            </a>
          </p>
          <p className="mt-2 whitespace-pre-wrap text-[16px] leading-relaxed text-ink">{q.question}</p>
        </div>

        <div>
          <label className="vx-field-label" htmlFor={`a-${q.id}`}>
            Your answer
          </label>
          <textarea
            id={`a-${q.id}`}
            className="vx-field !min-h-[120px]"
            value={answer}
            maxLength={2000}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write it the way you'd say it to them."
          />
        </div>

        {publish && (
          <div>
            <label className="vx-field-label" htmlFor={`w-${q.id}`}>
              Question as it appears on the FAQ <small>(tidy the wording if you like)</small>
            </label>
            <input id={`w-${q.id}`} className="vx-field" value={wording} maxLength={300} onChange={(e) => setWording(e.target.value)} />
          </div>
        )}

        <div className="flex flex-wrap gap-x-6 gap-y-3 text-[14px] text-ink">
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="h-4 w-4 accent-[var(--color-primary)]" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
            Show on the homepage FAQ
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="h-4 w-4 accent-[var(--color-primary)]" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            Email the answer to {q.name.split(/\s+/)[0]}
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <button type="button" className="vx-btn vx-btn-sm" onClick={save} disabled={state.kind === "saving"}>
            {state.kind === "saving" ? "Saving…" : answered ? "Update answer" : publish ? "Answer and publish" : "Save answer"}
          </button>
          {answered && q.published && (
            <button type="button" className="vx-link text-[14px]" onClick={unpublish}>
              Take off the website
            </button>
          )}
          {state.kind === "saved" && (
            <p role="status" className="text-[14px] text-primary">
              {state.text}
            </p>
          )}
          {state.kind === "error" && (
            <p role="alert" className="text-[14px] text-danger">
              {state.text}
            </p>
          )}
        </div>
      </div>
    </Row>
  );
}

const KIND_FILTERS = [
  { value: "", label: "All" },
  { value: "customer", label: "Customers" },
  { value: "freelancer", label: "Freelancers" },
  { value: "investor", label: "Investors" },
];

export function ContactsTab() {
  const [kind, setKind] = useState("");
  const { page, setPage, result, error, reload } = useAdminList<Contact>(`/api/admin/contacts${kind ? `?kind=${kind}` : ""}`);
  return (
    <Shell
      title="Contact messages"
      count={result?.pagination.total}
      actions={
        <div className="flex flex-wrap gap-1.5">
          {KIND_FILTERS.map((k) => (
            <button
              key={k.value}
              type="button"
              className="vx-chip !h-8 !px-3 !text-[13px]"
              aria-pressed={kind === k.value}
              onClick={() => {
                setKind(k.value);
                setPage(1);
              }}
            >
              {k.label}
            </button>
          ))}
        </div>
      }
    >
      <Status error={error} empty={result?.data.length === 0} />
      <ul>
        {result?.data.map((c) => (
          <Row
            key={c.id}
            onDelete={() => remove(`/api/admin/contacts?id=${c.id}`, reload)}
            summary={
              <span className="block">
                <span className={`mr-2 rounded-[6px] px-1.5 py-0.5 text-[12px] font-medium ${c.kind === "investor" ? "bg-primary text-white" : "bg-mist text-ink"}`}>
                  {c.kind}
                </span>
                <span className="font-medium text-ink">{c.name}</span>
                {c.company && <span className="text-slate"> · {c.company}</span>}
                <span className="ml-2 text-[13px] text-slate">{when(c.createdAt)}</span>
                <span className="mt-0.5 block truncate text-[14px] text-slate">{c.message}</span>
              </span>
            }
          >
            <dl className="mb-3 grid gap-x-6 gap-y-1 text-[13px] text-slate sm:grid-cols-2">
              {c.topic && (
                <div>
                  <dt className="inline">Topic: </dt>
                  <dd className="inline text-ink">{c.topic}</dd>
                </div>
              )}
              {c.stage && (
                <div>
                  <dt className="inline">Interested in: </dt>
                  <dd className="inline text-ink">{c.stage}</dd>
                </div>
              )}
              {c.website && (
                <div>
                  <dt className="inline">Link: </dt>
                  <dd className="inline">
                    <a className="text-primary underline" href={c.website} target="_blank" rel="noopener noreferrer">
                      {c.website}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
            <p className="whitespace-pre-wrap">{c.message}</p>
            <a className="vx-link mt-3 text-[14px]" href={`mailto:${c.email}?subject=${encodeURIComponent("Re: your message to Voxlate")}`}>
              Reply to {c.email}
            </a>
          </Row>
        ))}
      </ul>
      {result && <Pager page={page} totalPages={result.pagination.totalPages} setPage={setPage} />}
    </Shell>
  );
}
