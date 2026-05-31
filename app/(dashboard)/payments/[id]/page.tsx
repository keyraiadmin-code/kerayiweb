import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QRReceipt } from "@/components/qr-receipt";
import { formatCurrency, formatDate } from "@/lib/utils";
import { approvePayment, rejectPayment } from "@/app/actions/payments";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PaymentDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: payment, error } = await supabase
    .from("payments")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !payment) {
    console.error("Payment fetch error:", error);
    notFound();
  }

  // Separate queries for related data
  const [{ data: tenant }, { data: lease }] = await Promise.all([
    supabase.from("tenants").select("full_name, phone, email").eq("id", payment.tenant_id).single(),
    supabase.from("leases").select("unit_id").eq("id", payment.lease_id).single(),
  ]);

  const { data: unit } = lease
    ? await supabase
        .from("units")
        .select("unit_number, property_id, properties(name)")
        .eq("id", lease.unit_id)
        .single()
    : { data: null };

  const statusColors: Record<string, "success" | "warning" | "destructive"> = {
    approved: "success",
    pending: "warning",
    rejected: "destructive",
  };

  const rawProperties = unit?.properties;
  const propertyName = Array.isArray(rawProperties) && rawProperties.length > 0
    ? (rawProperties[0] as { name: string }).name
    : typeof rawProperties === 'object' && rawProperties !== null && !Array.isArray(rawProperties)
      ? (rawProperties as { name: string }).name
      : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/payments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Payment Details</h1>
          <p className="text-muted-foreground text-sm">
            {tenant?.full_name} · {formatDate(payment.due_date)}
          </p>
        </div>
        <Badge variant={statusColors[payment.status] ?? "secondary"} className="text-sm px-3 py-1">
          {payment.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="text-2xl font-bold text-brand">{formatCurrency(payment.amount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant={statusColors[payment.status] ?? "secondary"} className="mt-1">
                  {payment.status}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Due Date</p>
                <p className="font-medium">{formatDate(payment.due_date)}</p>
              </div>
              {payment.paid_date && (
                <div>
                  <p className="text-muted-foreground">Paid Date</p>
                  <p className="font-medium">{formatDate(payment.paid_date)}</p>
                </div>
              )}
            </div>
            {payment.method && (
              <div>
                <p className="text-muted-foreground">Payment Method</p>
                <p className="font-medium capitalize">{payment.method}</p>
              </div>
            )}
            {payment.reference_number && (
              <div>
                <p className="text-muted-foreground">Reference Number</p>
                <p className="font-mono font-medium">{payment.reference_number}</p>
              </div>
            )}
            {(payment.vat_amount || payment.withholding_amount || payment.penalty_amount) && (
              <div className="border rounded-md p-3 space-y-2 bg-muted/30">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tax &amp; Deductions</p>
                {payment.vat_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">VAT</span>
                    <span className="font-medium">{formatCurrency(payment.vat_amount)}</span>
                  </div>
                )}
                {payment.withholding_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Withholding Tax</span>
                    <span className="font-medium">{formatCurrency(payment.withholding_amount)}</span>
                  </div>
                )}
                {payment.penalty_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Penalty</span>
                    <span className="font-medium text-red-600">{formatCurrency(payment.penalty_amount)}</span>
                  </div>
                )}
              </div>
            )}

            {payment.notes && (
              <div>
                <p className="text-muted-foreground">Notes</p>
                <p>{payment.notes}</p>
              </div>
            )}

            {payment.approval_notes && (
              <div>
                <p className="text-muted-foreground">Approval Notes</p>
                <p>{payment.approval_notes}</p>
              </div>
            )}

            {/* Tenant info */}
            {tenant && (
              <>
                <div className="border-t pt-4">
                  <p className="font-medium mb-2">Tenant</p>
                  <p className="text-foreground">{tenant.full_name}</p>
                  {tenant.email && <p className="text-muted-foreground">{tenant.email}</p>}
                  {tenant.phone && <p className="text-muted-foreground">{tenant.phone}</p>}
                </div>
              </>
            )}

            {/* Unit info */}
            {unit && (
              <div className="border-t pt-4">
                <p className="font-medium mb-2">Property</p>
                <p>{propertyName}</p>
                <p className="text-muted-foreground">Unit {unit.unit_number}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Receipt or Actions */}
        <div className="space-y-4">
          {payment.status === "approved" && payment.receipt_number ? (
            <>
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Receipt</h3>
                <Button variant="outline" size="sm" className="gap-2 print:hidden">
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              </div>
              <QRReceipt
                receiptNumber={payment.receipt_number}
                tenantName={tenant?.full_name ?? ""}
                amount={payment.amount}
                paidDate={payment.paid_date ?? payment.due_date}
                method={payment.method ?? "bank"}
                referenceNumber={payment.reference_number ?? undefined}
                propertyName={propertyName}
                unitNumber={unit?.unit_number}
              />
            </>
          ) : payment.status === "pending" ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Review Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Tenant has submitted proof of payment. Review and approve or reject.
                </p>
                <form action={async (formData: FormData) => {
                  "use server";
                  const notes = (formData.get("approval_notes") as string) || undefined;
                  await approvePayment(id, notes);
                }} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="approval_notes">
                      Approval Notes <span className="text-muted-foreground text-xs">(optional)</span>
                    </label>
                    <textarea
                      id="approval_notes"
                      name="approval_notes"
                      rows={2}
                      placeholder="Any notes about this approval..."
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                  </div>
                  <Button className="w-full gap-2" type="submit">
                    <CheckCircle2 className="h-4 w-4" />
                    Approve Payment
                  </Button>
                </form>
                <form action={async () => {
                  "use server";
                  await rejectPayment(id);
                }}>
                  <Button variant="destructive" className="w-full gap-2" type="submit">
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-sm text-muted-foreground">
                {payment.status === "rejected"
                  ? "This payment was rejected."
                  : "No receipt available."}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
