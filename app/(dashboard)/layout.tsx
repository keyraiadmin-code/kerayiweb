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

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url")
    .eq("id", user.id)
    .single();

  const userInfo = {
    id: user.id,
    email: user.email,
    full_name: profile?.full_name,
    role: profile?.role,
    avatar_url: profile?.avatar_url,
  };

  return <DashboardShell user={userInfo}>{children}</DashboardShell>;
}
