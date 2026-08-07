import { getSession } from "@/lib/session";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

// middleware.ts already redirects non-admins away from /admin before this
// renders, so by the time we're here the session is guaranteed to be an
// authenticated admin. We still fetch it to display the admin's name.
export default async function AdminPage() {
  const session = await getSession();

  return <AdminDashboard adminName={session?.name ?? "Admin"} />;
}
