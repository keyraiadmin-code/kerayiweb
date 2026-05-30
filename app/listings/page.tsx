import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Building2, MapPin, Home, Bath, Maximize } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default async function PublicListingsPage() {
  const supabase = await createClient();

  const { data: listings, error } = await supabase
    .from("listings")
    .select("id, title, description, rent_amount, bedrooms, bathrooms, size_sqm, city, area, amenities, status, available_from")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) console.error("Public listings error:", error);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-brand">Keyrai</span>
        </Link>
        <div className="flex gap-3">
          <Link href="/login"><Button variant="outline" size="sm">Sign In</Button></Link>
          <Link href="/signup"><Button size="sm">List Your Property</Button></Link>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-br from-brand/10 to-transparent py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-2">Find Your Next Home in Ethiopia</h1>
          <p className="text-muted-foreground">Verified properties from trusted landlords on Keyrai</p>
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {!listings?.length ? (
          <div className="text-center py-20">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No listings available</h3>
            <p className="text-muted-foreground">Check back soon for new properties</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">{listings.length} properties available</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Link key={listing.id} href={`/listings/${listing.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <div className="h-48 bg-gradient-to-br from-brand/20 to-gold/10 rounded-t-lg flex items-center justify-center">
                      <Home className="h-16 w-16 text-brand/30" />
                    </div>
                    <CardContent className="pt-4 space-y-3">
                      <div>
                        <h3 className="font-semibold leading-tight">{listing.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {listing.area ? `${listing.area}, ` : ""}{listing.city}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Home className="h-3 w-3" />{listing.bedrooms} bed</span>
                        <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{listing.bathrooms} bath</span>
                        {listing.size_sqm && <span className="flex items-center gap-1"><Maximize className="h-3 w-3" />{listing.size_sqm}m²</span>}
                      </div>
                      {listing.amenities?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {listing.amenities.slice(0, 3).map((a: string) => (
                            <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
                          ))}
                          {listing.amenities.length > 3 && (
                            <Badge variant="secondary" className="text-xs">+{listing.amenities.length - 3}</Badge>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-1">
                        <p className="text-xl font-bold text-brand">{formatCurrency(listing.rent_amount)}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                        {listing.available_from && (
                          <p className="text-xs text-muted-foreground">From {listing.available_from}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
