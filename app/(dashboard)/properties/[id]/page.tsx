import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  Building2, MapPin, ArrowLeft, Plus, Home, Users, Wrench,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !property) notFound();

  const { data: units } = await supabase
    .from("units")
    .select("id, unit_number, floor, bedrooms, bathrooms, size_sqm, rent_amount, status, unit_type")
    .eq("property_id", id)
    .order("unit_number");

  const unitIds = (units || []).map((u) => u.id);
  const { data: maintenance } = unitIds.length
    ? await supabase
        .from("maintenance_requests")
        .select("id, title, priority, status, created_at")
        .in("unit_id", unitIds)
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: [] };

  const totalUnits = units?.length ?? 0;
  const occupiedUnits = (units || []).filter((u) => u.status === "occupied").length;
  const vacantUnits = totalUnits - occupiedUnits;

  const statusColors: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
    occupied: "success",
    vacant: "warning",
    maintenance: "destructive",
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
      <div className="flex flex-wrap items-start gap-3">
        <Link href="/properties">
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">{property.name}</h1>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{property.address}, {property.city}</span>
          </div>
        </div>
        <Link href={`/properties/${id}/units/new`}>
          <Button className="gap-2 flex-shrink-0">
            <Plus className="h-4 w-4" />
            Add Unit
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Total", value: totalUnits, icon: Home, color: "text-blue-600" },
          { label: "Occupied", value: occupiedUnits, icon: Users, color: "text-green-600" },
          { label: "Vacant", value: vacantUnits, icon: Building2, color: "text-orange-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 pt-4 pb-4">
              <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${color}`} />
              <div className="text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Property details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Property Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Type</p>
            <p className="font-medium capitalize">{property.type}</p>
          </div>
          <div>
            <p className="text-muted-foreground">City</p>
            <p className="font-medium">{property.city}</p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">Address</p>
            <p className="font-medium">{property.address}</p>
          </div>
          {property.description && (
            <div className="col-span-2">
              <p className="text-muted-foreground">Description</p>
              <p className="font-medium">{property.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Units */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Units ({totalUnits})</CardTitle>
          <Link href={`/properties/${id}/units/new`}>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="h-3 w-3" />
              Add Unit
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {!units?.length ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-3">No units added yet</p>
              <Link href={`/properties/${id}/units/new`}>
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" /> Add First Unit
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {units.map((unit) => (
                <div
                  key={unit.id}
                  className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 p-3 rounded-lg border hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="font-medium">Unit {unit.unit_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {unit.bedrooms}BR · {unit.bathrooms}BA
                      {unit.size_sqm ? ` · ${unit.size_sqm}m²` : ""}
                      {unit.floor != null ? ` · Floor ${unit.floor}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="font-semibold text-sm">
                      {formatCurrency(unit.rent_amount)}/mo
                    </p>
                    {unit.unit_type && unit.unit_type !== "residential" && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {unit.unit_type}
                      </Badge>
                    )}
                    <Badge variant={statusColors[unit.status] ?? "secondary"}>
                      {unit.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Maintenance */}
      {maintenance && maintenance.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Recent Maintenance
            </CardTitle>
            <Link href="/maintenance" className="text-xs text-brand hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {maintenance.map((m) => (
              <Link
                key={m.id}
                href={`/maintenance/${m.id}`}
                className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md gap-2"
              >
                <p className="text-sm truncate">{m.title}</p>
                <div className="flex gap-2 flex-shrink-0">
                  <Badge variant={priorityColors[m.priority] ?? "secondary"} className="text-xs">
                    {m.priority}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {m.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
