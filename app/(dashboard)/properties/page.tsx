import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Plus, MapPin, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function PropertiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  const { data: properties, error } = await supabase
    .from("properties")
    .select("id, name, address, city, type, total_units, image_url")
    .eq("org_id", profile?.org_id ?? "")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Properties fetch error:", error);
  }

  // Get unit counts for each property
  const propertyIds = (properties || []).map((p) => p.id);
  const { data: units } = propertyIds.length
    ? await supabase
        .from("units")
        .select("id, property_id, status")
        .in("property_id", propertyIds)
    : { data: [] };

  const unitsByProperty = (units || []).reduce(
    (acc, unit) => {
      if (!acc[unit.property_id]) acc[unit.property_id] = { total: 0, occupied: 0 };
      acc[unit.property_id].total++;
      if (unit.status === "occupied") acc[unit.property_id].occupied++;
      return acc;
    },
    {} as Record<string, { total: number; occupied: number }>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Properties</h1>
          <p className="text-muted-foreground text-sm">
            Manage your rental properties
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Property
        </Button>
      </div>

      {!properties?.length ? (
        <div className="text-center py-20">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No properties yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first property to get started
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => {
            const u = unitsByProperty[property.id] ?? { total: 0, occupied: 0 };
            const vacant = u.total - u.occupied;
            const occupancyRate = u.total > 0 ? Math.round((u.occupied / u.total) * 100) : 0;

            return (
              <Link key={property.id} href={`/properties/${property.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  {/* Property image placeholder */}
                  <div className="h-40 bg-gradient-to-br from-brand/20 to-brand/5 rounded-t-lg flex items-center justify-center">
                    <Building2 className="h-12 w-12 text-brand/40" />
                  </div>
                  <CardContent className="pt-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-base">{property.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {property.address}, {property.city}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {property.type}
                      </Badge>
                      <Badge
                        variant={occupancyRate >= 80 ? "success" : occupancyRate >= 50 ? "warning" : "secondary"}
                      >
                        {occupancyRate}% occupied
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="text-center">
                        <p className="text-lg font-bold">{u.total || property.total_units}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{u.occupied}</p>
                        <p className="text-xs text-muted-foreground">Occupied</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-orange-600">{vacant}</p>
                        <p className="text-xs text-muted-foreground">Vacant</p>
                      </div>
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
