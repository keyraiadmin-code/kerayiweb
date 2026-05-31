import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Building2, Users, CreditCard, Wrench, TrendingUp, AlertCircle, Sparkles, ArrowRight, Home, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { MiniChart } from "@/components/dashboard/mini-chart";
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

  // Fetch properties first to get IDs for units query
  const { data: orgProps } = await supabase
    .from("properties")
    .select("id")
    .eq("org_id", orgId ?? "");

  const propCount = orgProps?.length ?? 0;
  const orgPropertyIds = (orgProps ?? []).map((p) => p.id);

  const unitsPromise = orgPropertyIds.length
    ? supabase.from("units").select("status").in("property_id", orgPropertyIds)
    : Promise.resolve({ data: [] as Array<{ status: string }>, error: null });

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const oneYearAgoStr = oneYearAgo.toISOString().split("T")[0];

  const [
    { count: tenantCount },
    { data: payments },
    { count: maintenanceCount },
    { data: recentPayments },
    { data: recentMaintenance },
    { data: allUnits },
    { count: oldTenantsCount },
  ] = await Promise.all([
    supabase.from("tenants").select("*", { count: "exact", head: true }).eq("org_id", orgId ?? ""),
    supabase.from("payments").select("amount, status, paid_date").eq("org_id", orgId ?? ""),
    supabase.from("maintenance_requests").select("*", { count: "exact", head: true }).eq("org_id", orgId ?? "").in("status", ["open", "in_progress"]),
    supabase.from("payments").select("id, amount, status, due_date, tenants(full_name)").eq("org_id", orgId ?? "").order("created_at", { ascending: false }).limit(5),
    supabase.from("maintenance_requests").select("id, title, priority, status, created_at").eq("org_id", orgId ?? "").order("created_at", { ascending: false }).limit(5),
    unitsPromise,
    supabase.from("leases").select("*", { count: "exact", head: true }).eq("org_id", orgId ?? "").eq("status", "active").lte("start_date", oneYearAgoStr),
  ]);

  const approvedPayments = (payments || []).filter((p) => p.status === "approved");
  const monthlyRevenue = approvedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingPaymentsList = (payments || []).filter((p) => p.status === "pending");
  const pendingCount = pendingPaymentsList.length;
  const pendingAmount = pendingPaymentsList.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Build 6-month revenue sparkline from paid_date
  const now = new Date();
  const monthlyRevenueTrend: number[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return approvedPayments
      .filter((p) => p.paid_date?.startsWith(prefix))
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  });

  const prevMonthRevenue = monthlyRevenueTrend[4] ?? 0;
  const curMonthRevenue = monthlyRevenueTrend[5] ?? 0;
  const revenueChange = prevMonthRevenue > 0
    ? Math.round(((curMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
    : null;

  const totalUnits = allUnits?.length ?? 0;
  const vacantCount = (allUnits ?? []).filter((u) => u.status === "vacant").length;

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

      {/* Onboarding banner for new users */}
      {propCount === 0 && (
        <div className="rounded-xl border-2 border-brand/20 bg-gradient-to-r from-brand/10 to-brand/5 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 bg-brand/15 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-brand" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Set up your portfolio</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              You haven&apos;t added any properties yet. Follow the quick setup guide to get started.
            </p>
          </div>
          <Link href="/onboarding">
            <Button className="gap-2 flex-shrink-0">
              Start Setup <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Alert for pending payments */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            You have <strong>{pendingCount}</strong> pending payment
            {pendingCount > 1 ? "s" : ""} ({formatCurrency(pendingAmount)}) awaiting approval.{" "}
            <Link href="/payments" className="underline font-medium">
              Review now →
            </Link>
          </p>
        </div>
      )}

      {/* Stats grid — 6 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Properties */}
        <Link href="/properties">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-950">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Properties</p>
                <p className="text-2xl font-bold">{propCount}</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Units */}
        <Link href="/properties">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-950">
                <Home className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Units</p>
                <p className="text-2xl font-bold">{totalUnits}</p>
                {vacantCount > 0 && (
                  <p className="text-xs text-brand font-medium">{vacantCount} available for rent</p>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Tenants */}
        <Link href="/tenants">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50 dark:bg-green-950">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tenants</p>
                <p className="text-2xl font-bold">{tenantCount ?? 0}</p>
                {(oldTenantsCount ?? 0) > 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {oldTenantsCount} long-term (1+ yr)
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Revenue with sparkline */}
        <Link href="/payments">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6 pb-3">
              <div className="flex items-start gap-4 mb-2">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-950 flex-shrink-0">
                  <CreditCard className="h-6 w-6 text-brand" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</p>
                  {revenueChange !== null && (
                    <p className={`text-xs font-medium ${revenueChange >= 0 ? "text-brand" : "text-red-500"}`}>
                      {revenueChange >= 0 ? "+" : ""}{revenueChange}% vs last month
                    </p>
                  )}
                </div>
              </div>
              <MiniChart data={monthlyRevenueTrend} type="bar" color="#0e8a5b" />
            </CardContent>
          </Card>
        </Link>

        {/* Open Maintenance */}
        <Link href="/maintenance">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-50 dark:bg-orange-950">
                <Wrench className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Maintenance</p>
                <p className="text-2xl font-bold">{maintenanceCount ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Pending Payments */}
        <Link href="/payments">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-yellow-50 dark:bg-yellow-950">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
                {pendingCount > 0 && (
                  <p className="text-xs text-yellow-600 font-medium">{formatCurrency(pendingAmount)}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
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

        {/* Recent Maintenance */}
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

      {/* Quick links */}
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
