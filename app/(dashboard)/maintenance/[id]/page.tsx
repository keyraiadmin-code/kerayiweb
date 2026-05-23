import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils";
import { updateMaintenanceStatus, assignVendor } from "@/app/actions/maintenance";

interface Props { params: Promise<{ id: string }> }

export default async function MaintenanceDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: request, error } = await supabase
    .from("maintenance_requests").select("*").eq("id", id).single();

  if (error || !request) { console.error("Maintenance fetch error:", error); notFound(); }

  const [{ data: unit }, { data: tenant }, { data: vendor }] = await Promise.all([
    supabase.from("units").select("unit_number, property_id, properties(name)").eq("id", request.unit_id).single(),
    request.tenant_id ? supabase.from("tenants").select("full_name, phone").eq("id", request.tenant_id).single() : Promise.resolve({ data: null }),
    request.vendor_id ? supabase.from("vendors").select("name, phone, category").eq("id", request.vendor_id).single() : Promise.resolve({ data: null }),
  ]);

  const { data: vendors } = await supabase.from("vendors").select("id, name, category").eq("active", true).order("name");

  const rawProperties = unit?.properties;
  const propertyName = Array.isArray(rawProperties) && rawProperties.length > 0
    ? (rawProperties[0] as { name: string }).name
    : typeof rawProperties === 'object' && rawProperties !== null && !Array.isArray(rawProperties)
      ? (rawProperties as { name: string }).name
      : undefined;
  const priorityColors: Record<string, "destructive" | "warning" | "info" | "secondary"> = {
    urgent: "destructive", high: "warning", medium: "info", low: "secondary",
  };
  const statusOptions = [
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Link href="/maintenance"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{request.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={priorityColors[request.priority] ?? "secondary"}>{request.priority}</Badge>
            <Badge variant="outline">{request.status.replace("_", " ")}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Request Details</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div><p className="text-muted-foreground">Description</p><p className="mt-1">{request.description}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-muted-foreground">Property</p><p className="font-medium">{propertyName ?? "N/A"}</p></div>
                <div><p className="text-muted-foreground">Unit</p><p className="font-medium">{unit?.unit_number ?? "N/A"}</p></div>
                {request.category && <div><p className="text-muted-foreground">Category</p><p className="font-medium capitalize">{request.category}</p></div>}
                <div><p className="text-muted-foreground">Reported</p><p className="font-medium">{formatDate(request.created_at)}</p></div>
                {request.scheduled_date && <div><p className="text-muted-foreground">Scheduled</p><p className="font-medium">{formatDate(request.scheduled_date)}</p></div>}
                {request.completed_date && <div><p className="text-muted-foreground">Completed</p><p className="font-medium">{formatDate(request.completed_date)}</p></div>}
                {request.cost != null && <div><p className="text-muted-foreground">Cost</p><p className="font-medium">{formatCurrency(request.cost)}</p></div>}
              </div>
              {request.notes && <div><p className="text-muted-foreground">Notes</p><p>{request.notes}</p></div>}
              {tenant && (
                <div className="border-t pt-4">
                  <p className="font-medium mb-2 flex items-center gap-2"><User className="h-4 w-4" />Reported by</p>
                  <p>{tenant.full_name}</p>
                  {tenant.phone && <p className="text-muted-foreground">{tenant.phone}</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Update Status</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {statusOptions.map(({ value, label }) => (
                <form key={value} action={async () => { "use server"; await updateMaintenanceStatus(id, value); }}>
                  <Button type="submit" variant={request.status === value ? "default" : "outline"} className="w-full" size="sm">{label}</Button>
                </form>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">{vendor ? "Assigned Vendor" : "Assign Vendor"}</CardTitle></CardHeader>
            <CardContent>
              {vendor ? (
                <div className="text-sm space-y-1">
                  <p className="font-medium">{vendor.name}</p>
                  <p className="text-muted-foreground capitalize">{vendor.category}</p>
                  {vendor.phone && <p className="text-muted-foreground">{vendor.phone}</p>}
                </div>
              ) : vendors?.length ? (
                <div className="space-y-2">
                  {vendors.slice(0, 5).map((v) => (
                    <form key={v.id} action={async () => { "use server"; await assignVendor(id, v.id); }}>
                      <Button type="submit" variant="outline" className="w-full justify-start" size="sm">
                        <div className="text-left"><p className="font-medium">{v.name}</p><p className="text-xs text-muted-foreground capitalize">{v.category}</p></div>
                      </Button>
                    </form>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No vendors. <Link href="/vendors" className="text-brand hover:underline">Add vendors →</Link></p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
