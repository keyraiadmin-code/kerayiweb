import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreditCard, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  let query = supabase
    .from("payments")
    .select("id, amount, due_date, paid_date, status, method, reference_number, receipt_number, tenant_id")
    .eq("org_id", profile?.org_id ?? "")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: payments, error } = await query;
  if (error) console.error("Payments fetch error:", error);

  // Get tenant names
  const tenantIds = Array.from(new Set((payments || []).map((p) => p.tenant_id)));
  const { data: tenants } = tenantIds.length
    ? await supabase.from("tenants").select("id, full_name").in("id", tenantIds)
    : { data: [] };

  const tenantMap = (tenants || []).reduce(
    (acc, t) => { acc[t.id] = t.full_name; return acc; },
    {} as Record<string, string>
  );

  const statusColors: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
    approved: "success",
    pending: "warning",
    rejected: "destructive",
  };

  const statuses = ["all", "pending", "approved", "rejected"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-muted-foreground text-sm">Review and approve tenant payments</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <Link key={s} href={s === "all" ? "/payments" : `/payments?status=${s}`}>
            <Button
              variant={(!status && s === "all") || status === s ? "default" : "outline"}
              size="sm"
              className="capitalize"
            >
              {s}
            </Button>
          </Link>
        ))}
      </div>

      {!payments?.length ? (
        <div className="text-center py-20">
          <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No payments found</h3>
          <p className="text-muted-foreground">
            {status ? `No ${status} payments` : "No payments recorded yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <Link key={payment.id} href={`/payments/${payment.id}`}>
              <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <p className="font-medium">{tenantMap[payment.tenant_id] ?? "Unknown tenant"}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {formatDate(payment.due_date)}
                      {payment.paid_date && ` · Paid: ${formatDate(payment.paid_date)}`}
                    </p>
                    {payment.method && (
                      <p className="text-xs text-muted-foreground capitalize">
                        via {payment.method}
                        {payment.reference_number && ` · Ref: ${payment.reference_number}`}
                      </p>
                    )}
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-lg font-bold">{formatCurrency(payment.amount)}</p>
                    <Badge variant={statusColors[payment.status] ?? "secondary"}>
                      {payment.status}
                    </Badge>
                    {payment.receipt_number && (
                      <p className="text-xs text-muted-foreground font-mono">{payment.receipt_number}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
