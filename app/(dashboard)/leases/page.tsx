import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileSignature, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function LeasesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.id).single();

  const { data: leases, error } = await supabase
    .from("leases")
    .select("id, start_date, end_date, rent_amount, deposit_amount, status, payment_day, tenant_id, unit_id")
    .eq("org_id", profile?.org_id ?? "")
    .order("created_at", { ascending: false });

  if (error) console.error("Leases error:", error);

  const tenantIds = Array.from(new Set((leases || []).map((l) => l.tenant_id)));
  const unitIds = Array.from(new Set((leases || []).map((l) => l.unit_id)));

  const [{ data: tenants }, { data: units }] = await Promise.all([
    tenantIds.length ? supabase.from("tenants").select("id, full_name").in("id", tenantIds) : Promise.resolve({ data: [] }),
    unitIds.length ? supabase.from("units").select("id, unit_number, property_id, properties(name)").in("id", unitIds) : Promise.resolve({ data: [] }),
  ]);

  const tenantMap = (tenants || []).reduce((acc, t) => { acc[t.id] = t.full_name; return acc; }, {} as Record<string, string>);
  const unitMap = (units || []).reduce(
    (acc: Record<string, { id: string; unit_number: string; property_id: string; properties: { name: string }[] | null }>, u) => {
      acc[u.id] = u;
      return acc;
    },
    {}
  );

  const statusColors: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
    active: "success", expired: "secondary", terminated: "destructive", draft: "warning",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Leases</h1>
          <p className="text-muted-foreground text-sm">All lease contracts</p>
        </div>
        <Link href="/leases/new">
          <Button className="gap-2 w-full sm:w-auto"><Plus className="h-4 w-4" />New Lease</Button>
        </Link>
      </div>

      {!leases?.length ? (
        <div className="text-center py-20">
          <FileSignature className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No leases yet</h3>
          <p className="text-muted-foreground mb-4">Create leases to link tenants to units</p>
          <Link href="/leases/new">
            <Button><Plus className="h-4 w-4 mr-2" />New Lease</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {leases.map((lease) => {
            const unit = unitMap[lease.unit_id];
            const rawProperties = unit?.properties;
            const propertyName = Array.isArray(rawProperties) && rawProperties.length > 0
              ? (rawProperties[0] as { name: string }).name
              : typeof rawProperties === 'object' && rawProperties !== null && !Array.isArray(rawProperties)
                ? (rawProperties as { name: string }).name
                : undefined;
            return (
              <Card key={lease.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{tenantMap[lease.tenant_id] ?? "Unknown"}</p>
                        <Badge variant={statusColors[lease.status] ?? "secondary"}>{lease.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {propertyName && `${propertyName} · `}Unit {unit?.unit_number ?? "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(lease.start_date)} → {formatDate(lease.end_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(lease.rent_amount)}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                      <p className="text-xs text-muted-foreground">Deposit: {formatCurrency(lease.deposit_amount)}</p>
                      <p className="text-xs text-muted-foreground">Due day {lease.payment_day}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
