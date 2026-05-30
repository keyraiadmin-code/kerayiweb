import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createLease } from "@/app/actions/leases";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewLeasePage({ searchParams }: Props) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  const [{ data: tenants }, { data: units }] = await Promise.all([
    supabase
      .from("tenants")
      .select("id, full_name")
      .eq("org_id", profile?.org_id ?? "")
      .order("full_name"),
    supabase
      .from("units")
      .select("id, unit_number, property_id, rent_amount, properties(name)")
      .eq("status", "vacant")
      .order("unit_number"),
  ]);

  // Filter units that belong to this org via properties
  const propertyIds = (units || [])
    .map((u) => u.property_id)
    .filter(Boolean);
  const { data: orgProperties } = propertyIds.length
    ? await supabase
        .from("properties")
        .select("id")
        .eq("org_id", profile?.org_id ?? "")
        .in("id", propertyIds)
    : { data: [] };

  const orgPropertyIds = new Set((orgProperties || []).map((p) => p.id));
  const availableUnits = (units || []).filter((u) => orgPropertyIds.has(u.property_id));

  const today = new Date().toISOString().split("T")[0];
  const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/leases">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Lease</h1>
          <p className="text-muted-foreground text-sm">Create a lease agreement</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 text-sm">
          {decodeURIComponent(error)}
        </div>
      )}

      {!tenants?.length || !availableUnits.length ? (
        <Card>
          <CardContent className="py-8 text-center space-y-2">
            <p className="text-muted-foreground">
              {!tenants?.length
                ? "You need at least one tenant before creating a lease."
                : "No vacant units available. Add units to a property first."}
            </p>
            <div className="flex gap-2 justify-center pt-2">
              {!tenants?.length && (
                <Link href="/tenants/new">
                  <Button size="sm">Add Tenant</Button>
                </Link>
              )}
              {!availableUnits.length && (
                <Link href="/properties">
                  <Button size="sm">Manage Properties</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lease Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createLease} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Tenant *</label>
                  <select
                    name="tenant_id"
                    required
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="">Select tenant</option>
                    {(tenants || []).map((t) => (
                      <option key={t.id} value={t.id}>{t.full_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Unit *</label>
                  <select
                    name="unit_id"
                    required
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="">Select unit</option>
                    {availableUnits.map((u) => {
                      const propName = Array.isArray(u.properties)
                        ? (u.properties[0] as { name: string } | undefined)?.name
                        : (u.properties as { name: string } | null)?.name;
                      return (
                        <option key={u.id} value={u.id}>
                          {propName ? `${propName} — ` : ""}Unit {u.unit_number}
                          {u.rent_amount ? ` (${u.rent_amount}/mo)` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Start Date *</label>
                  <input
                    type="date"
                    name="start_date"
                    required
                    defaultValue={today}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">End Date *</label>
                  <input
                    type="date"
                    name="end_date"
                    required
                    defaultValue={oneYearLater}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Monthly Rent *</label>
                  <input
                    type="number"
                    name="rent_amount"
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g. 15000"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Security Deposit</label>
                  <input
                    type="number"
                    name="deposit_amount"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 30000"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Payment Due Day</label>
                  <input
                    type="number"
                    name="payment_day"
                    min="1"
                    max="31"
                    defaultValue="1"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                  <p className="text-xs text-muted-foreground">Day of month rent is due (1–31)</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit">Create Lease</Button>
                <Link href="/leases">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
