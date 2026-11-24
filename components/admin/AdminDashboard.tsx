"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Briefcase, ExternalLink, Inbox, LayoutGrid, LogOut, MessageCircleQuestion, Star, UserRound, Users } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ContactsTab, QuestionsTab, ReviewsTab } from "./InboxTabs";

type Stats = {
  totalWaitlist: number;
  totalUsers: number;
  newLast7Days: number;
  totalApplications: number;
  openQuestions?: number;
  totalQuestions?: number;
  totalContacts?: number;
  totalReviews?: number;
  byProduct: { product: string; count: number }[];
  byType: { type: string; count: number }[];
};

type WaitlistEntry = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  type: string;
  product: string;
  source: string | null;
  createdAt: string;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
};

type JobApplication = {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  college: string;
  currentYear: string;
  roleAppliedFor: string;
  strongestSkills: string;
  motivation: string;
  projectDetails: string | null;
  proposedIdea: string;
  uniqueEdge: string;
  portfolioLinks: string | null;
  resumeUrl: string;
  status: string;
  createdAt: string;
};

type Tab = "overview" | "questions" | "contacts" | "reviews" | "applications" | "waitlist" | "users";

const TABS: { id: Tab; label: string; icon: typeof Inbox; count?: (s: Stats) => number | undefined; alert?: boolean }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "questions", label: "Questions", icon: MessageCircleQuestion, count: (s) => s.openQuestions, alert: true },
  { id: "contacts", label: "Contact", icon: Inbox, count: (s) => s.totalContacts },
  { id: "reviews", label: "Reviews", icon: Star, count: (s) => s.totalReviews },
  { id: "applications", label: "Team applications", icon: Briefcase, count: (s) => s.totalApplications },
  { id: "waitlist", label: "Waitlist", icon: Users, count: (s) => s.totalWaitlist },
  { id: "users", label: "Users", icon: UserRound, count: (s) => s.totalUsers },
];

const TITLES: Record<Tab, { title: string; note: string }> = {
  overview: { title: "Overview", note: "What came in, and what needs you." },
  questions: { title: "Questions", note: "Answer what visitors asked. Published answers join the homepage FAQ." },
  contacts: { title: "Contact", note: "Customers, freelancers and investors who wrote in." },
  reviews: { title: "Reviews", note: "Everything on the homepage loop. Remove anything that shouldn’t be there." },
  applications: { title: "Team applications", note: "People who want to build Voxlate with you." },
  waitlist: { title: "Waitlist", note: "Everyone who joined. This list is private to admins." },
  users: { title: "Users", note: "Accounts, and who has admin access." },
};

function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    fetch("/api/admin/stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json.status !== "success") throw new Error();
        setStats(json.data);
      })
      .catch(() => setFailed(true));
  }, [version]);
  return { stats, failed, refresh: useCallback(() => setVersion((v) => v + 1), []) };
}

export function AdminDashboard({ adminName }: { adminName: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const { stats, failed, refresh } = useStats();

  useEffect(() => {
    document.title = "Admin — Voxlate";
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    // Back to the site; the admin sign-in lives on the normal login page.
    router.push("/");
    router.refresh();
  }

  const go = (next: Tab) => {
    setTab(next);
    refresh();
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-svh bg-page lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="sticky top-0 z-20 bg-night text-page lg:flex lg:h-svh lg:flex-col">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:py-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Back to the website">
            <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-page">
              <Logo className="h-7 w-auto" />
            </span>
            <span className="text-[17px] font-bold tracking-[-0.02em]" style={{ fontFamily: "var(--font-display)" }}>
              Voxlate <span className="font-medium text-page/50">admin</span>
            </span>
          </Link>
          <button type="button" onClick={handleLogout} className="flex h-9 w-9 items-center justify-center rounded-[8px] text-page/70 hover:bg-page/10 hover:text-page lg:hidden" aria-label="Sign out">
            <LogOut size={17} />
          </button>
        </div>
        <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-0">
          {TABS.map((t) => {
            const Icon = t.icon;
            const count = stats && t.count ? t.count(stats) : undefined;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => go(t.id)}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-3 whitespace-nowrap rounded-[8px] px-3 py-2.5 text-left text-[14.5px] font-medium transition-colors ${
                  active ? "bg-page text-ink" : "text-page/70 hover:bg-page/10 hover:text-page"
                }`}
              >
                <Icon size={17} aria-hidden />
                <span className="flex-1">{t.label}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`rounded-[6px] px-1.5 py-0.5 text-[12px] font-semibold tabular-nums ${
                      t.alert ? "bg-primary text-white" : active ? "bg-mist text-ink" : "bg-page/10 text-page/80"
                    }`}
                  >
                    {count.toLocaleString("en-IN")}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto hidden border-t border-page/10 p-4 lg:block">
          <p className="truncate text-[13px] text-page/50">Signed in as</p>
          <p className="truncate text-[15px] font-semibold">{adminName}</p>
          <div className="mt-3 flex items-center gap-4 text-[13px]">
            <Link href="/" target="_blank" className="inline-flex items-center gap-1.5 text-page/70 hover:text-page">
              View site <ExternalLink size={13} aria-hidden />
            </Link>
            <button type="button" onClick={handleLogout} className="inline-flex items-center gap-1.5 text-page/70 hover:text-page">
              Sign out <LogOut size={13} aria-hidden />
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="min-w-0 px-4 pb-16 pt-8 sm:px-8 lg:px-12 lg:pt-12">
        <header className="mb-8 max-w-[1100px]">
          <h1 className="vx-display text-[clamp(2rem,4vw,3rem)] text-ink">{TITLES[tab].title}</h1>
          <p className="mt-2 text-[15px] text-slate">{TITLES[tab].note}</p>
        </header>
        <div className="max-w-[1100px]">
          {tab === "overview" && <OverviewTab stats={stats} failed={failed} onGo={go} />}
          {tab === "waitlist" && <WaitlistTab />}
          {tab === "users" && <UsersTab />}
          {tab === "applications" && <ApplicationsTab />}
          {tab === "reviews" && <ReviewsTab />}
          {tab === "questions" && <QuestionsTab onChange={refresh} />}
          {tab === "contacts" && <ContactsTab />}
        </div>
      </main>
    </div>
  );
}

// ---------------- Overview ----------------

function OverviewTab({ stats, failed, onGo }: { stats: Stats | null; failed: boolean; onGo: (tab: Tab) => void }) {
  if (failed) return <p className="text-[15px] text-danger">Couldn’t load the numbers. Refresh to try again.</p>;
  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3" aria-busy="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[112px] animate-pulse rounded-[10px] bg-mist" />
        ))}
      </div>
    );
  }

  const open = stats.openQuestions ?? 0;
  const cards: { label: string; value: number | undefined; tab: Tab; note?: string }[] = [
    { label: "Waitlist", value: stats.totalWaitlist, tab: "waitlist" },
    { label: "Accounts", value: stats.totalUsers, tab: "users", note: `${stats.newLast7Days} new this week` },
    { label: "Open questions", value: open, tab: "questions", note: `${stats.totalQuestions ?? 0} asked in total` },
    { label: "Contact messages", value: stats.totalContacts, tab: "contacts" },
    { label: "Reviews", value: stats.totalReviews, tab: "reviews" },
    { label: "Team applications", value: stats.totalApplications, tab: "applications" },
  ];

  return (
    <div className="space-y-8">
      {open > 0 && (
        <button
          type="button"
          onClick={() => onGo("questions")}
          className="group flex w-full items-center justify-between gap-4 rounded-[12px] bg-primary px-6 py-5 text-left text-white transition-colors hover:bg-primary-hover"
        >
          <span>
            <span className="block text-[18px] font-semibold">
              {open} question{open === 1 ? "" : "s"} waiting for an answer
            </span>
            <span className="mt-1 block text-[14px] text-white/75">Answer them and choose which ones go on the homepage FAQ.</span>
          </span>
          <ArrowRight size={20} className="shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
        </button>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {cards.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => onGo(c.tab)}
            className="group rounded-[10px] border border-line bg-surface p-5 text-left transition-colors hover:border-line-strong"
          >
            <span className="flex items-center justify-between text-[14px] text-slate">
              {c.label}
              <ArrowRight size={15} className="opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
            </span>
            <span className="vx-display mt-2 block text-[40px] leading-none text-ink tabular-nums">{(c.value ?? 0).toLocaleString("en-IN")}</span>
            {c.note && <span className="mt-2 block text-[13px] text-slate">{c.note}</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <BreakdownCard title="Waitlist by product" rows={stats.byProduct.map((p) => ({ label: p.product, count: p.count }))} />
        <BreakdownCard title="Waitlist by type" rows={stats.byType.map((t) => ({ label: t.type, count: t.count }))} />
      </div>
    </div>
  );
}

function BreakdownCard({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  const total = rows.reduce((sum, r) => sum + r.count, 0) || 1;
  return (
    <div className="rounded-[10px] border border-line bg-surface p-5">
      <p className="mb-4 text-[15px] font-semibold text-ink">{title}</p>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1.5 flex justify-between text-[14px]">
              <span className="capitalize text-slate">{r.label}</span>
              <span className="font-medium text-ink tabular-nums">{r.count}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-mist">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(r.count / total) * 100}%` }} />
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-[14px] text-slate">No data yet.</p>}
      </div>
    </div>
  );
}

// ---------------- Waitlist ----------------

function WaitlistTab() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const abortControllerRef = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "25" });
    if (search) params.set("search", search);
    fetch(`/api/admin/waitlist?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((json) => {
        setEntries(json.data ?? []);
        setTotalPages(json.pagination?.totalPages ?? 1);
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [load]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-param-change pattern; setLoading(true) inside load() causes one harmless extra render
    load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Remove this signup from the waitlist?")) return;
    await fetch(`/api/admin/waitlist?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] p-4">
        <input
          type="text"
          placeholder="Search name, email, company…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="w-64 rounded-[var(--radius-input)] border border-[var(--color-border)] px-3 py-1.5 text-sm outline-none focus:border-[var(--color-orange)]"
        />
        <a
          href="/api/admin/waitlist/export"
          download
          className="rounded-[var(--radius-button)] border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-alt)]"
        >
          Export CSV
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Company</th>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">Product</th>
              <th className="px-4 py-2 font-medium">Joined</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-4 py-2 text-[var(--color-text-primary)]">{e.name}</td>
                <td className="px-4 py-2 text-[var(--color-text-secondary)]">{e.email}</td>
                <td className="px-4 py-2 text-[var(--color-text-secondary)]">{e.company || "—"}</td>
                <td className="px-4 py-2 capitalize text-[var(--color-text-secondary)]">{e.type}</td>
                <td className="px-4 py-2 capitalize text-[var(--color-text-secondary)]">{e.product}</td>
                <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                  {new Date(e.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="text-sm text-[var(--color-danger)] hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {!loading && entries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                  No waitlist signups found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

// ---------------- Users ----------------

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const abortControllerRef = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "25" });
    if (search) params.set("search", search);
    fetch(`/api/admin/users?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((json) => {
        setUsers(json.data ?? []);
        setTotalPages(json.pagination?.totalPages ?? 1);
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [load]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-param-change pattern; setLoading(true) inside load() causes one harmless extra render
    load();
  }, [load]);

  async function toggleRole(user: AdminUser) {
    const nextRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, role: nextRole }),
    });
    const json = await res.json();
    if (json.status !== "success") {
      alert(json.message || "Could not update role.");
      return;
    }
    load();
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      <div className="border-b border-[var(--color-border)] p-4">
        <input
          type="text"
          placeholder="Search name, email…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="w-64 rounded-[var(--radius-input)] border border-[var(--color-border)] px-3 py-1.5 text-sm outline-none focus:border-[var(--color-orange)]"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Joined</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-4 py-2 text-[var(--color-text-primary)]">{u.name}</td>
                <td className="px-4 py-2 text-[var(--color-text-secondary)]">{u.email}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-[var(--radius-pill)] px-2 py-0.5 text-xs font-medium ${
                      u.role === "ADMIN"
                        ? "bg-[var(--color-gold-light)] text-[var(--color-gold)]"
                        : "bg-[var(--color-bg-surface-alt)] text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => toggleRole(u)}
                    className="text-sm text-[var(--color-accent-blue)] hover:underline"
                  >
                    {u.role === "ADMIN" ? "Revoke admin" : "Make admin"}
                  </button>
                </td>
              </tr>
            ))}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

// ---------------- Applications ----------------

function ApplicationsTab() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const abortControllerRef = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "25" });
    if (search) params.set("search", search);
    fetch(`/api/admin/applications?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((json) => {
        setApplications(json.data ?? []);
        setTotalPages(json.pagination?.totalPages ?? 1);
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [load]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-param-change pattern; setLoading(true) inside load() causes one harmless extra render
    load();
  }, [load]);

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] p-4">
        <input
          type="text"
          placeholder="Search name, email, college…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="w-64 rounded-[var(--radius-input)] border border-[var(--color-border)] px-3 py-1.5 text-sm outline-none focus:border-[var(--color-orange)]"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Contact</th>
              <th className="px-4 py-2 font-medium">College</th>
              <th className="px-4 py-2 font-medium">Year</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Applied</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-4 py-2 text-[var(--color-text-primary)]">{app.fullName}</td>
                <td className="px-4 py-2 text-[var(--color-text-secondary)]">{app.email}</td>
                <td className="px-4 py-2 text-[var(--color-text-secondary)]">{app.contactNumber}</td>
                <td className="px-4 py-2 text-[var(--color-text-secondary)]">{app.college}</td>
                <td className="px-4 py-2 text-[var(--color-text-secondary)]">{app.currentYear}</td>
                <td className="px-4 py-2 text-[var(--color-text-secondary)]">{app.roleAppliedFor}</td>
                <td className="px-4 py-2">
                  <span className="rounded-[var(--radius-pill)] bg-[var(--color-bg-surface-alt)] px-2 py-0.5 text-xs font-medium text-[var(--color-text-secondary)]">
                    {app.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-[var(--color-text-secondary)]">
                  {new Date(app.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-right">
                  <a
                    href={app.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--color-accent-blue)] hover:underline"
                  >
                    Resume
                  </a>
                </td>
              </tr>
            ))}
            {!loading && applications.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                  No applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

// ---------------- Shared ----------------

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="rounded-[var(--radius-button)] border border-[var(--color-border)] px-3 py-1 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="rounded-[var(--radius-button)] border border-[var(--color-border)] px-3 py-1 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
