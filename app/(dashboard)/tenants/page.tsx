import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Plus, Phone, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrustMeter } from "@/components/trust-meter";
import { getInitials } from "@/lib/utils";

export default async function TenantsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  const { data: tenants, error } = await supabase
    .from("tenants")
    .select("id, full_name, email, phone, trust_score, id_verified, created_at")
    .eq("org_id", profile?.org_id ?? "")
    .order("full_name");

  if (error) console.error("Tenants fetch error:", error);

  // Get active leases for each tenant — separate simple query, no nested selects
  const tenantIds = (tenants || []).map((t) => t.id);
  const { data: leases } = tenantIds.length
    ? await supabase
        .from("leases")
        .select("tenant_id, status, unit_id")
        .in("tenant_id", tenantIds)
        .eq("status", "active")
    : { data: [] };

  const leaseByTenant = (leases || []).reduce(
    (acc: Record<string, boolean>, lease) => {
      acc[lease.tenant_id] = true;
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Tenants</h1>
          <p className="text-muted-foreground text-sm">
            Manage your tenants and track trust scores
          </p>
        </div>
        <Link href="/tenants/new">
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Add Tenant
          </Button>
        </Link>
      </div>

      {!tenants?.length ? (
        <div className="text-center py-20">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No tenants yet</h3>
          <p className="text-muted-foreground mb-4">Add your first tenant to get started</p>
          <Link href="/tenants/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Tenant
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenants.map((tenant) => {
            const lease = !!leaseByTenant[tenant.id];
            return (
              <Link key={tenant.id} href={`/tenants/${tenant.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-brand/10 text-brand text-sm">
                          {getInitials(tenant.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{tenant.full_name}</p>
                        {tenant.email && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {tenant.email}
                          </p>
                        )}
                        {tenant.phone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {tenant.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <TrustMeter score={tenant.trust_score ?? 0} size="sm" />

                    <div className="flex items-center gap-2 flex-wrap">
                      {tenant.id_verified && (
                        <Badge variant="success" className="text-xs">ID Verified</Badge>
                      )}
                      {lease ? (
                        <Badge variant="default" className="text-xs">Active Lease</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">No Active Lease</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
