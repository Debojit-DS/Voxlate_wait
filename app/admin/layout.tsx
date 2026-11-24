import type { ReactNode } from "react";

// No title here: visitors who aren't admins get the ordinary "page not found" under this layout, and
// nothing should say an admin area exists. The dashboard sets its own title once an admin is signed in.
export const metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[var(--color-bg-page)]">{children}</div>;
}
