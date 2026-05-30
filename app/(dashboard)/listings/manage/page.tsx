import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ListFilter, Plus, Home, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default async function ManageListingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.id).single();

  const { data: listings, error } = await supabase
    .from("listings")
    .select("id, title, rent_amount, bedrooms, bathrooms, city, area, status, available_from, unit_id")
    .eq("org_id", profile?.org_id ?? "")
    .order("created_at", { ascending: false });

  if (error) console.error("Listings error:", error);

  const statusColors: Record<string, "success" | "secondary" | "warning"> = {
    active: "success", inactive: "secondary", rented: "warning",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-muted-foreground text-sm">Manage your active listings on the marketplace</p>
        </div>
        <div className="flex gap-2">
          <Link href="/listings" target="_blank">
            <Button variant="outline" className="gap-2"><Eye className="h-4 w-4" />View Marketplace</Button>
          </Link>
          <Button className="gap-2"><Plus className="h-4 w-4" />New Listing</Button>
        </div>
      </div>

      {!listings?.length ? (
        <div className="text-center py-20">
          <ListFilter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No listings yet</h3>
          <p className="text-muted-foreground mb-4">Create a listing to attract tenants on the marketplace</p>
          <Button><Plus className="h-4 w-4 mr-2" />New Listing</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <Card key={listing.id} className="hover:shadow-md transition-shadow">
              <div className="h-32 bg-gradient-to-br from-brand/20 to-brand/5 rounded-t-lg flex items-center justify-center">
                <Home className="h-10 w-10 text-brand/40" />
              </div>
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold leading-tight">{listing.title}</p>
                  <Badge variant={statusColors[listing.status] ?? "secondary"} className="flex-shrink-0">{listing.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{listing.area ? `${listing.area}, ` : ""}{listing.city}</p>
                <p className="text-sm">{listing.bedrooms}BR · {listing.bathrooms}BA</p>
                <p className="font-bold text-brand">{formatCurrency(listing.rent_amount)}<span className="font-normal text-muted-foreground text-xs">/mo</span></p>
                {listing.available_from && (
                  <p className="text-xs text-muted-foreground">Available: {listing.available_from}</p>
                )}
                <Link href={`/listings/${listing.id}`} target="_blank">
                  <Button variant="outline" size="sm" className="w-full gap-1 mt-1"><Eye className="h-3 w-3" />View Public</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
