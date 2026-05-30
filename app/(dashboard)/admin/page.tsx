import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ShieldCheck, Users, Building2, CreditCard, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role, org_id").eq("id", user.id).single();

  if (profile?.role !== "admin") {
    return (
      <div className="text-center py-20">
        <ShieldCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-2">Admin Access Required</h3>
        <p className="text-muted-foreground">You need admin role to view this page.</p>
      </div>
    );
  }

  const [
    { count: orgCount },
    { count: userCount },
    { count: propCount },
    { data: recentProfiles },
  ] = await Promise.all([
    supabase.from("organizations").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("properties").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("id, full_name, role, created_at").order("created_at", { ascending: false }).limit(10),
  ]);

  const stats = [
    { label: "Organizations", value: orgCount ?? 0, icon: Building2 },
    { label: "Users", value: userCount ?? 0, icon: Users },
    { label: "Properties", value: propCount ?? 0, icon: Building2 },
  ];

  const roleColors: Record<string, "success" | "warning" | "info" | "secondary" | "default"> = {
    admin: "destructive" as never,
    landlord: "default",
    agent: "info",
    tenant: "success",
    vendor: "warning",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-brand" /> Admin Panel
        </h1>
        <p className="text-muted-foreground text-sm">System-wide overview</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 pt-4">
              <Icon className="h-8 w-8 text-brand" />
              <div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Users</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(recentProfiles || []).map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{p.full_name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(p.created_at)}</p>
                </div>
                <Badge variant={roleColors[p.role] ?? "secondary"} className="capitalize">{p.role}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
