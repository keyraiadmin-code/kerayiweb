import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recordPayment } from "@/app/actions/payments";

interface Props {
  searchParams: { error?: string };
}

export default async function NewPaymentPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  const { data: leases } = await supabase
    .from("leases")
    .select("id, rent_amount, tenant_id, unit_id, tenants(full_name), units(unit_number, properties(name))")
    .eq("org_id", profile?.org_id ?? "")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/payments">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Record Payment</h1>
          <p className="text-muted-foreground text-sm">Log a rent payment from a tenant</p>
        </div>
      </div>

      {searchParams.error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {searchParams.error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={recordPayment} className="space-y-5">
            <input type="hidden" name="org_id" value={profile?.org_id ?? ""} />

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="lease_id">
                Tenant / Lease <span className="text-destructive">*</span>
              </label>
              {!leases?.length ? (
                <p className="text-sm text-muted-foreground py-2">
                  No active leases found.{" "}
                  <Link href="/leases" className="text-brand hover:underline">Add a lease →</Link>
                </p>
              ) : (
                <select
                  id="lease_id"
                  name="lease_id"
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select a tenant</option>
                  {leases.map((lease) => {
                    const tenantName = Array.isArray(lease.tenants)
                      ? (lease.tenants[0] as { full_name: string } | undefined)?.full_name
                      : (lease.tenants as { full_name: string } | null)?.full_name;
                    const unitNum = Array.isArray(lease.units)
                      ? (lease.units[0] as { unit_number: string } | undefined)?.unit_number
                      : (lease.units as { unit_number: string } | null)?.unit_number;
                    const propName = Array.isArray(lease.units)
                      ? ((lease.units[0] as { properties: { name: string }[] | { name: string } | null } | undefined)?.properties)
                      : ((lease.units as { properties: { name: string }[] | { name: string } | null } | null)?.properties);
                    const propertyName = Array.isArray(propName)
                      ? propName[0]?.name
                      : (propName as { name: string } | null)?.name;
                    return (
                      <option key={lease.id} value={lease.id}>
                        {tenantName} — {propertyName} Unit {unitNum} (ETB {lease.rent_amount}/mo)
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="amount">
                  Amount (ETB) <span className="text-destructive">*</span>
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="1"
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="due_date">
                  Due Date <span className="text-destructive">*</span>
                </label>
                <input
                  id="due_date"
                  name="due_date"
                  type="date"
                  required
                  defaultValue={today}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="method">Payment Method</label>
                <select
                  id="method"
                  name="method"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="telebirr">Telebirr</option>
                  <option value="cbe_birr">CBE Birr</option>
                  <option value="check">Check</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="reference_number">
                  Reference No. <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <input
                  id="reference_number"
                  name="reference_number"
                  type="text"
                  placeholder="Transaction / receipt ref"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="notes">
                Notes <span className="text-muted-foreground text-xs">(optional)</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="Any notes about this payment..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div className="rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 px-4 py-3 text-sm text-blue-800 dark:text-blue-200">
              This will record the payment as <strong>approved</strong> and generate a receipt immediately.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="submit" className="flex-1" disabled={!leases?.length}>
                Record &amp; Approve Payment
              </Button>
              <Link href="/payments">
                <Button type="button" variant="outline" className="w-full sm:w-auto">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
