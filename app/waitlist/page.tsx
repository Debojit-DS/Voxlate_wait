"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { useWaitlistModal } from "@/components/waitlist/WaitlistModalProvider";
import { getPublicWaitlist, type PublicWaitlistEntry } from "@/lib/waitlistApi";
import { User, ChevronRight } from "lucide-react";

function formatDate(iso: string) {
  const d = new Date(iso);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = String(d.getDate()).padStart(2, "0");
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export default function WaitlistPage() {
  const { openModal } = useWaitlistModal();
  const [entries, setEntries] = useState<PublicWaitlistEntry[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPublicWaitlist(page, pageSize).then((res) => {
      if (cancelled) return;
      setEntries(res.data ?? []);
      setTotalPages(res.pagination?.totalPages ?? 1);
      setTotal(res.pagination?.total ?? 0);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [page, pageSize]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-6 md:px-8 py-12">
        <section className="text-center mb-12">
          <span className="inline-block rounded-full bg-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange mb-4">
            Our Community
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">View Our Waitlisters</h1>
          <p className="text-text-secondary max-w-2xl mx-auto mb-8">
            Join a growing community of individuals and organizations ready to experience Voxlate. Here&apos;s who&apos;s already on the list.
          </p>
          <div className="inline-flex items-center gap-3 rounded-card border border-border bg-bg-surface px-6 py-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange/10 text-orange">
              <User size={20} />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-text-primary">{total.toLocaleString()}+</p>
              <p className="text-xs text-text-secondary">Total Waitlisters and growing...</p>
            </div>
          </div>
        </section>

        <section className="rounded-card border border-border bg-bg-surface shadow-sm overflow-hidden mb-10">
          <div className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_180px] gap-4 px-6 py-4 border-b border-border bg-bg-surface-alt">
            <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Waitlister</span>
            <span className="hidden md:block text-xs font-bold uppercase tracking-widest text-text-muted text-right">Joined On</span>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-text-secondary text-sm">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="px-6 py-12 text-center text-text-secondary text-sm">No waitlist entries yet.</div>
          ) : (
            <ul className="divide-y divide-border">
              {entries.map((entry) => (
                <li key={entry.id} className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_180px] gap-4 px-6 py-4 items-center hover:bg-bg-surface-alt transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-20 w-20 shrink-0 rounded-full border border-border bg-bg-surface-alt overflow-hidden flex items-center justify-center">
                      {entry.photoUrl ? (
                        <img
                          src={entry.photoUrl}
                          alt={entry.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="text-text-muted" size={32} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-text-primary truncate">{entry.name}</p>
                      {entry.role && <p className="text-xs text-text-secondary truncate">{entry.role}</p>}
                      {entry.organization && (
                        <p className="text-xs text-accent-blue truncate">{entry.organization}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm text-text-secondary whitespace-nowrap">{formatDate(entry.createdAt)}</span>
                    <span className="text-success">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mb-16">
            <Button
              variant="outline-navy"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-text-secondary">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline-navy"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        )}

        <section className="text-center rounded-card border border-border bg-bg-surface p-8 md:p-12 shadow-sm">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">Be the next one!</h2>
          <p className="text-text-secondary mb-6">Join the waitlist and get early access to Voxlate.</p>
          <Button variant="primary-orange" onClick={() => openModal("waitlist-page")} className="text-base px-8 py-3">
            Join Waitlist <ChevronRight size={18} />
          </Button>
          <p className="mt-6 text-xs text-text-muted flex items-center justify-center gap-1">
            🔒 We respect your privacy. Your information is safe with us.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
