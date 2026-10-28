import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getApiBase } from "@/lib/server/apiProxy";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("voxlate_session")?.value;
  if (!sessionCookie) {
    redirect("/admin/login");
  }

  try {
    const apiBase = getApiBase();
    const res = await fetch(`${apiBase.origin}/api/auth/me`, {
      headers: {
        cookie: `voxlate_session=${sessionCookie}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      redirect("/admin/login");
    }

    const json = await res.json();
    if (json.status !== "success" || json.data?.role !== "ADMIN") {
      redirect("/admin/login");
    }

    return <AdminDashboard adminName={json.data.name || "Admin"} />;
  } catch {
    redirect("/admin/login");
  }
}

