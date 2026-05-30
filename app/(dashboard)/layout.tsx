import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/app/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: orgs }] = await Promise.all([
    supabase.from("profiles").select("full_name, role, avatar_url, org_id").eq("id", user.id).single(),
    supabase.from("organizations").select("id, name, slug").eq("owner_id", user.id).order("name"),
  ]);

  const userInfo = {
    id: user.id,
    email: user.email,
    full_name: profile?.full_name,
    role: profile?.role,
    avatar_url: profile?.avatar_url,
    org_id: profile?.org_id,
  };

  return (
    <DashboardShell user={userInfo} orgs={orgs ?? []}>
      {children}
    </DashboardShell>
  );
}
