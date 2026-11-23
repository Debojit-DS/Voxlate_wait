import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getApiBase } from "@/lib/server/apiProxy";

export const dynamic = "force-dynamic";

/** Returns the admin's display name, or null when the session isn't an admin one. */
async function adminName(sessionCookie: string): Promise<string | null> {
  try {
    const res = await fetch(`${getApiBase().origin}/api/auth/me`, {
      headers: { cookie: `voxlate_session=${sessionCookie}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.status === "success" && json.data?.role === "ADMIN" ? json.data.name || "Admin" : null;
  } catch {
    return null;
  }
}

export default async function AdminPage() {
  const sessionCookie = (await cookies()).get("voxlate_session")?.value;
  if (!sessionCookie) redirect("/admin/login");
  const name = await adminName(sessionCookie);
  if (!name) redirect("/admin/login");
  return <AdminDashboard adminName={name} />;
}
