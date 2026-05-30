import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ReceiptsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  const { data: payments, error } = await supabase
    .from("payments")
    .select("id, amount, paid_date, due_date, method, reference_number, receipt_number, tenant_id")
    .eq("org_id", profile?.org_id ?? "")
    .eq("status", "approved")
    .not("receipt_number", "is", null)
    .order("paid_date", { ascending: false });

  if (error) console.error("Receipts fetch error:", error);

  const tenantIds = Array.from(new Set((payments || []).map((p) => p.tenant_id)));
  const { data: tenants } = tenantIds.length
    ? await supabase.from("tenants").select("id, full_name").in("id", tenantIds)
    : { data: [] };

  const tenantMap = (tenants || []).reduce(
    (acc, t) => { acc[t.id] = t.full_name; return acc; },
    {} as Record<string, string>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Receipts</h1>
        <p className="text-muted-foreground text-sm">
          All approved payment receipts ({payments?.length ?? 0} total)
        </p>
      </div>

      {!payments?.length ? (
        <div className="text-center py-20">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No receipts yet</h3>
          <p className="text-muted-foreground">
            Receipts are generated automatically when payments are approved
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
                    <p className="font-mono text-sm text-brand">{payment.receipt_number}</p>
                    <p className="text-xs text-muted-foreground">
                      Paid: {payment.paid_date ? formatDate(payment.paid_date) : formatDate(payment.due_date)}
                      {payment.method && ` · via ${payment.method}`}
                      {payment.reference_number && ` · Ref: ${payment.reference_number}`}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-lg font-bold">{formatCurrency(payment.amount)}</p>
                    <Badge variant="success">Paid</Badge>
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
