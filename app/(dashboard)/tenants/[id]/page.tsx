import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  Shield,
  CreditCard,
  FileSignature,
  Wrench,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { TrustMeter } from "@/components/trust-meter";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TenantDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // FIX: Simple query — no nested selects
  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !tenant) {
    console.error("Tenant fetch error:", error);
    notFound();
  }

  // Separate query for leases
  const { data: leases } = await supabase
    .from("leases")
    .select("id, start_date, end_date, rent_amount, deposit_amount, status, unit_id")
    .eq("tenant_id", id)
    .order("start_date", { ascending: false });

  // FIX: Get unit info via separate query — no nested relationship selects
  const unitIds = (leases || []).map((l) => l.unit_id).filter(Boolean);
  const { data: units } = unitIds.length
    ? await supabase
        .from("units")
        .select("id, unit_number, property_id")
        .in("id", unitIds)
    : { data: [] };

  // FIX: Get property names via a third separate query
  const propertyIds = [...new Set((units || []).map((u) => u.property_id).filter(Boolean))];
  const { data: propertiesData } = propertyIds.length
    ? await supabase
        .from("properties")
        .select("id, name")
        .in("id", propertyIds)
    : { data: [] };

  const propertyMap = (propertiesData || []).reduce(
    (acc, p) => {
      acc[p.id] = p.name;
      return acc;
    },
    {} as Record<string, string>
  );

  const unitMap = (units || []).reduce(
    (acc, u) => {
      acc[u.id] = {
        unit_number: u.unit_number,
        property_name: propertyMap[u.property_id] ?? null,
      };
      return acc;
    },
    {} as Record<string, { unit_number: string; property_name: string | null }>
  );

  // Separate query for payments
  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, due_date, paid_date, status, method, receipt_number")
    .eq("tenant_id", id)
    .order("due_date", { ascending: false })
    .limit(10);

  // Separate query for maintenance
  const { data: maintenance } = await supabase
    .from("maintenance_requests")
    .select("id, title, priority, status, created_at")
    .eq("tenant_id", id)
    .order("created_at", { ascending: false })
    .limit(5);

  const activeLease = leases?.find((l) => l.status === "active");
  const approvedPayments = (payments || []).filter((p) => p.status === "approved");
  const totalPaid = approvedPayments.reduce((s, p) => s + (p.amount || 0), 0);

  const statusColors: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
    approved: "success",
    pending: "warning",
    rejected: "destructive",
  };

  const priorityColors: Record<string, "destructive" | "warning" | "info" | "secondary"> = {
    urgent: "destructive",
    high: "warning",
    medium: "info",
    low: "secondary",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/tenants">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-4 flex-1">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-brand/10 text-brand text-lg">
              {getInitials(tenant.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{tenant.full_name}</h1>
            <div className="flex items-center gap-3 mt-1">
              {tenant.email && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {tenant.email}
                </span>
              )}
              {tenant.phone && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {tenant.phone}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {tenant.id_verified ? (
            <Badge variant="success" className="gap-1">
              <ShieldCheck className="h-3 w-3" /> ID Verified
            </Badge>
          ) : (
            <Badge variant="warning" className="gap-1">
              <ShieldAlert className="h-3 w-3" /> Not Verified
            </Badge>
          )}
        </div>
      </div>

      {/* Trust Score + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Trust Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrustMeter score={tenant.trust_score ?? 0} size="lg" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-brand">{formatCurrency(totalPaid)}</p>
            <p className="text-sm text-muted-foreground">Total Paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{leases?.length ?? 0}</p>
            <p className="text-sm text-muted-foreground">Lease{leases?.length !== 1 ? "s" : ""}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Lease */}
      {activeLease && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileSignature className="h-4 w-4" />
              Active Lease
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Unit</p>
              <p className="font-medium">
                {unitMap[activeLease.unit_id]?.unit_number ?? "N/A"}
              </p>
            </div>
            {unitMap[activeLease.unit_id]?.property_name && (
              <div>
                <p className="text-muted-foreground">Property</p>
                <p className="font-medium">
                  {unitMap[activeLease.unit_id].property_name}
                </p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Rent</p>
              <p className="font-medium">{formatCurrency(activeLease.rent_amount)}/mo</p>
            </div>
            <div>
              <p className="text-muted-foreground">Start</p>
              <p className="font-medium">{formatDate(activeLease.start_date)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">End</p>
              <p className="font-medium">{formatDate(activeLease.end_date)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment History
          </CardTitle>
          <Link href="/payments" className="text-xs text-brand hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {!payments?.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">No payments recorded</p>
          ) : (
            <div className="space-y-2">
              {payments.map((p) => (
                <Link key={p.id} href={`/payments/${p.id}`} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                  <div>
                    <p className="text-sm font-medium">{formatCurrency(p.amount)}</p>
                    <p className="text-xs text-muted-foreground">Due {p.due_date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.receipt_number && (
                      <span className="text-xs text-muted-foreground font-mono">{p.receipt_number}</span>
                    )}
                    <Badge variant={statusColors[p.status] ?? "secondary"} className="text-xs">
                      {p.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Maintenance */}
      {maintenance && maintenance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Maintenance Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {maintenance.map((m) => (
              <Link key={m.id} href={`/maintenance/${m.id}`} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                <p className="text-sm">{m.title}</p>
                <div className="flex gap-2">
                  <Badge variant={priorityColors[m.priority] ?? "secondary"} className="text-xs">
                    {m.priority}
                  </Badge>
                  <Badge variant="outline" className="text-xs">{m.status}</Badge>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
