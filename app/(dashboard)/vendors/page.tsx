import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { HardHat, Plus, Star, Phone, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function VendorsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.id).single();

  const { data: vendors, error } = await supabase
    .from("vendors")
    .select("id, name, category, phone, email, rating, active, notes")
    .eq("org_id", profile?.org_id ?? "")
    .order("name");

  if (error) console.error("Vendors error:", error);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Vendors</h1>
          <p className="text-muted-foreground text-sm">Maintenance and service vendors</p>
        </div>
        <Link href="/vendors/new">
          <Button className="gap-2 w-full sm:w-auto"><Plus className="h-4 w-4" />Add Vendor</Button>
        </Link>
      </div>

      {!vendors?.length ? (
        <div className="text-center py-20">
          <HardHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No vendors yet</h3>
          <p className="text-muted-foreground mb-4">Add vendors to assign them to maintenance requests</p>
          <Link href="/vendors/new">
            <Button><Plus className="h-4 w-4 mr-2" />Add Vendor</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((vendor) => (
            <Card key={vendor.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{vendor.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{vendor.category}</p>
                  </div>
                  <Badge variant={vendor.active ? "success" : "secondary"}>{vendor.active ? "Active" : "Inactive"}</Badge>
                </div>

                {vendor.rating > 0 && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < vendor.rating ? "text-gold fill-gold" : "text-muted-foreground"}`} />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">{vendor.rating}/5</span>
                  </div>
                )}

                <div className="space-y-1 text-sm">
                  {vendor.phone && (
                    <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3 w-3" />{vendor.phone}</p>
                  )}
                  {vendor.email && (
                    <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3 w-3" />{vendor.email}</p>
                  )}
                </div>

                {vendor.notes && <p className="text-xs text-muted-foreground border-t pt-2">{vendor.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
