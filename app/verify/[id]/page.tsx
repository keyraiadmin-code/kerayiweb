import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Building2, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Props { params: Promise<{ id: string }> }

export default async function VerifyReceiptPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // id is the receipt number
  const { data: payment } = await supabase
    .from("payments")
    .select("id, amount, paid_date, due_date, method, reference_number, receipt_number, status, tenant_id")
    .eq("receipt_number", id)
    .eq("status", "approved")
    .single();

  const isValid = !!payment;
  let tenantName = "";

  if (payment) {
    const { data: tenant } = await supabase.from("tenants").select("full_name").eq("id", payment.tenant_id).single();
    tenantName = tenant?.full_name ?? "";
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Brand */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-brand">Keyrai</span>
          </Link>
          <p className="text-sm text-muted-foreground mt-1">Receipt Verification</p>
        </div>

        {isValid ? (
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-green-700 dark:text-green-400">Receipt Verified ✓</CardTitle>
              <p className="text-sm text-muted-foreground">This receipt is authentic and was issued by Keyrai</p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receipt #</span>
                  <span className="font-mono font-bold">{payment!.receipt_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tenant</span>
                  <span className="font-medium">{tenantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-brand">{formatCurrency(payment!.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{formatDate(payment!.paid_date ?? payment!.due_date)}</span>
                </div>
                {payment!.method && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method</span>
                    <span className="capitalize">{payment!.method}</span>
                  </div>
                )}
                {payment!.reference_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference</span>
                    <span className="font-mono text-xs">{payment!.reference_number}</span>
                  </div>
                )}
              </div>
              <Badge variant="success" className="w-full justify-center py-2">✓ Authentic Keyrai Receipt</Badge>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <CardTitle className="text-red-700 dark:text-red-400">Receipt Not Found</CardTitle>
              <p className="text-sm text-muted-foreground">
                Receipt <span className="font-mono font-bold">{id}</span> could not be verified. It may be invalid or the URL was incorrect.
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <Badge variant="destructive" className="px-4 py-2">⚠ Cannot Verify</Badge>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <Link href="/"><Button variant="ghost" size="sm">Back to Keyrai</Button></Link>
        </div>
      </div>
    </div>
  );
}
