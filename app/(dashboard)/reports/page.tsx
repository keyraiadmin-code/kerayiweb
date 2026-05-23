import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.id).single();
  const orgId = profile?.org_id ?? "";

  const [
    { count: totalProps },
    { count: totalTenants },
    { count: totalUnits },
    { data: payments },
    { count: openMaint },
    { count: resolvedMaint },
  ] = await Promise.all([
    supabase.from("properties").select("*", { count: "exact", head: true }).eq("org_id", orgId),
    supabase.from("tenants").select("*", { count: "exact", head: true }).eq("org_id", orgId),
    supabase.from("units").select("*", { count: "exact", head: true }),
    supabase.from("payments").select("amount, status, due_date").eq("org_id", orgId),
    supabase.from("maintenance_requests").select("*", { count: "exact", head: true }).eq("org_id", orgId).in("status", ["open", "in_progress"]),
    supabase.from("maintenance_requests").select("*", { count: "exact", head: true }).eq("org_id", orgId).eq("status", "resolved"),
  ]);

  const allPayments = payments || [];
  const approvedPayments = allPayments.filter((p) => p.status === "approved");
  const pendingPayments = allPayments.filter((p) => p.status === "pending");
  const rejectedPayments = allPayments.filter((p) => p.status === "rejected");

  const totalRevenue = approvedPayments.reduce((s, p) => s + (p.amount || 0), 0);
  const pendingRevenue = pendingPayments.reduce((s, p) => s + (p.amount || 0), 0);

  // Monthly breakdown from payments
  const monthlyMap: Record<string, number> = {};
  approvedPayments.forEach((p) => {
    const month = p.due_date?.slice(0, 7) ?? "Unknown";
    monthlyMap[month] = (monthlyMap[month] || 0) + (p.amount || 0);
  });
  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6);

  const summaryCards = [
    { label: "Total Revenue (Approved)", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "text-green-600" },
    { label: "Pending Revenue", value: formatCurrency(pendingRevenue), icon: TrendingDown, color: "text-yellow-600" },
    { label: "Total Properties", value: String(totalProps ?? 0), icon: BarChart3, color: "text-blue-600" },
    { label: "Total Tenants", value: String(totalTenants ?? 0), icon: BarChart3, color: "text-brand" },
    { label: "Open Maintenance", value: String(openMaint ?? 0), icon: BarChart3, color: "text-orange-600" },
    { label: "Resolved Maintenance", value: String(resolvedMaint ?? 0), icon: TrendingUp, color: "text-green-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground text-sm">Financial and operational overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 pt-5">
              <Icon className={`h-8 w-8 ${color}`} />
              <div>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment status breakdown */}
      <Card>
        <CardHeader><CardTitle className="text-base">Payment Status Breakdown</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "Approved", count: approvedPayments.length, color: "bg-green-500" },
              { label: "Pending", count: pendingPayments.length, color: "bg-yellow-500" },
              { label: "Rejected", count: rejectedPayments.length, color: "bg-red-500" },
            ].map(({ label, count, color }) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{label}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="h-2 bg-muted rounded-full">
                  <div
                    className={`h-2 rounded-full ${color}`}
                    style={{ width: allPayments.length > 0 ? `${(count / allPayments.length) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly revenue */}
      {monthlyData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Revenue (Last 6 Months)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyData.map(([month, amount]) => {
                const maxAmount = Math.max(...monthlyData.map(([, v]) => v));
                const pct = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                return (
                  <div key={month} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{month}</span>
                      <span className="font-medium">{formatCurrency(amount)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div className="h-2 rounded-full bg-brand" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
