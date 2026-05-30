import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Building2, Users, CreditCard, Wrench, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id, full_name, role")
    .eq("id", user.id)
    .single();

  const orgId = profile?.org_id;

  const [
    { count: propCount },
    { count: tenantCount },
    { data: payments },
    { count: maintenanceCount },
    { data: recentPayments },
    { data: recentMaintenance },
  ] = await Promise.all([
    supabase.from("properties").select("*", { count: "exact", head: true }).eq("org_id", orgId ?? ""),
    supabase.from("tenants").select("*", { count: "exact", head: true }).eq("org_id", orgId ?? ""),
    supabase.from("payments").select("amount, status").eq("org_id", orgId ?? ""),
    supabase.from("maintenance_requests").select("*", { count: "exact", head: true }).eq("org_id", orgId ?? "").in("status", ["open", "in_progress"]),
    supabase.from("payments").select("id, amount, status, due_date, tenants(full_name)").eq("org_id", orgId ?? "").order("created_at", { ascending: false }).limit(5),
    supabase.from("maintenance_requests").select("id, title, priority, status, created_at").eq("org_id", orgId ?? "").order("created_at", { ascending: false }).limit(5),
  ]);

  const monthlyRevenue = (payments || [])
    .filter((p) => p.status === "approved")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingPayments = (payments || []).filter((p) => p.status === "pending").length;

  const stats = [
    {
      label: "Total Properties",
      value: propCount ?? 0,
      icon: Building2,
      href: "/properties",
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      label: "Total Tenants",
      value: tenantCount ?? 0,
      icon: Users,
      href: "/tenants",
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950",
    },
    {
      label: "Monthly Revenue",
      value: formatCurrency(monthlyRevenue),
      icon: CreditCard,
      href: "/payments",
      color: "text-brand",
      bg: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      label: "Open Maintenance",
      value: maintenanceCount ?? 0,
      icon: Wrench,
      href: "/maintenance",
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-950",
    },
  ];

  const priorityColors: Record<string, string> = {
    urgent: "destructive",
    high: "warning",
    medium: "info",
    low: "secondary",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {profile?.full_name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="text-muted-foreground text-sm">
          Here&apos;s what&apos;s happening with your properties
        </p>
      </div>

      {pendingPayments > 0 && (
        <div className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            You have <strong>{pendingPayments}</strong> pending payment
            {pendingPayments > 1 ? "s" : ""} awaiting approval.{" "}
            <Link href="/payments" className="underline font-medium">
              Review now →
            </Link>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, href, color, bg }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Payments</CardTitle>
            <Link href="/payments" className="text-xs text-brand hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {!recentPayments?.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">No payments yet</p>
            ) : (
              recentPayments.map((p) => (
                <Link key={p.id} href={`/payments/${p.id}`} className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-md -mx-2">
                  <div>
                    <p className="text-sm font-medium">
                      {(Array.isArray(p.tenants) ? (p.tenants[0] as { full_name: string } | undefined)?.full_name : (p.tenants as { full_name: string } | null)?.full_name) ?? "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">Due {p.due_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCurrency(p.amount)}</p>
                    <Badge
                      variant={
                        p.status === "approved"
                          ? "success"
                          : p.status === "rejected"
                          ? "destructive"
                          : "warning"
                      }
                      className="text-xs"
                    >
                      {p.status}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Maintenance</CardTitle>
            <Link href="/maintenance" className="text-xs text-brand hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {!recentMaintenance?.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">No maintenance requests</p>
            ) : (
              recentMaintenance.map((m) => (
                <Link key={m.id} href={`/maintenance/${m.id}`} className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-md -mx-2">
                  <div>
                    <p className="text-sm font-medium">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{m.created_at.split("T")[0]}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={priorityColors[m.priority] as "destructive" | "warning" | "info" | "secondary" | "default"} className="text-xs">
                      {m.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {m.status}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {[
            { label: "Add Property", href: "/properties/new" },
            { label: "Add Tenant", href: "/tenants/new" },
            { label: "Record Payment", href: "/payments/new" },
            { label: "New Work Order", href: "/maintenance/new" },
            { label: "View Reports", href: "/reports" },
          ].map(({ label, href }) => (
            <Link key={href} href={href}>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted px-4 py-2 text-sm">
                {label}
              </Badge>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
