import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Building2, Home, Bath, BedDouble, MapPin, Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ListingsFilterBar } from "@/components/listings/filter-bar";

const GRADIENTS = [
  "from-emerald-300/30 via-teal-200/20 to-brand/10",
  "from-blue-300/25 via-sky-200/15 to-indigo-100/20",
  "from-violet-300/25 via-purple-200/15 to-pink-100/20",
  "from-amber-300/25 via-orange-200/15 to-yellow-100/20",
  "from-rose-300/25 via-pink-200/15 to-red-100/20",
  "from-cyan-300/25 via-teal-200/15 to-sky-100/20",
];

function cardGradient(id: string) {
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return GRADIENTS[n % GRADIENTS.length];
}

interface Props {
  searchParams: Promise<{ q?: string; beds?: string; maxRent?: string; sort?: string }>;
}

export default async function PublicListingsPage({ searchParams }: Props) {
  const { q, beds, maxRent, sort } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select("id, title, description, rent_amount, bedrooms, bathrooms, size_sqm, city, area, amenities, status, available_from")
    .eq("status", "active");

  if (q) query = query.or(`title.ilike.%${q}%,city.ilike.%${q}%,area.ilike.%${q}%`);
  if (beds === "0") query = query.eq("bedrooms", 0);
  else if (beds && beds !== "") {
    const n = parseInt(beds);
    if (n >= 4) query = query.gte("bedrooms", 4);
    else query = query.eq("bedrooms", n);
  }
  if (maxRent) query = query.lte("rent_amount", parseFloat(maxRent));
  if (sort === "price_asc") query = query.order("rent_amount", { ascending: true });
  else if (sort === "price_desc") query = query.order("rent_amount", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data: listings, error } = await query;
  if (error) console.error("Public listings error:", error);

  const hasFilters = !!(q || beds || maxRent || sort);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 border-b bg-background">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <Home className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-brand">Keyrai</span>
        </Link>
        <div className="flex gap-2">
          <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
          <Link href="/signup"><Button size="sm">List Your Property</Button></Link>
        </div>
      </nav>

      {/* Hero search */}
      <div className="bg-gradient-to-br from-brand/10 via-brand/5 to-transparent py-10 px-4 sm:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Find Your Next Home</h1>
          <p className="text-muted-foreground mb-6">Verified properties from trusted landlords on Keyrai</p>
          <form method="GET" action="/listings" className="flex gap-2 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                name="q"
                defaultValue={q}
                placeholder="City, area, or keyword…"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <Button type="submit" className="h-10 px-5">Search</Button>
          </form>
        </div>
      </div>

      {/* Sticky filter bar */}
      <ListingsFilterBar initialQ={q} initialBeds={beds} initialMaxRent={maxRent} initialSort={sort} />

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {listings?.length ?? 0} {hasFilters ? "matching " : ""}
            propert{listings?.length === 1 ? "y" : "ies"}
            {hasFilters ? " found" : " available"}
          </p>
          <Link href="/signup">
            <Button variant="outline" size="sm" className="gap-1.5 hidden sm:flex">
              <Plus className="h-3.5 w-3.5" /> List a Property
            </Button>
          </Link>
        </div>

        {!listings?.length ? (
          <div className="text-center py-24">
            <Building2 className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No listings found</h3>
            <p className="text-muted-foreground mb-6">
              {hasFilters ? "Try adjusting your filters or search term." : "Check back soon for new properties."}
            </p>
            {hasFilters && (
              <Link href="/listings">
                <Button variant="outline">Clear filters</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => {
              const isNew = new Date(listing.available_from ?? "2099").getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
              return (
                <Link key={listing.id} href={`/listings/${listing.id}`}>
                  <Card className="hover:shadow-xl transition-all duration-200 cursor-pointer h-full group overflow-hidden border-border/60">
                    {/* Photo / gradient area */}
                    <div className={`relative h-52 bg-gradient-to-br ${cardGradient(listing.id)} flex items-end justify-end p-3`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Home className="h-16 w-16 text-brand/15" />
                      </div>
                      {/* Price badge */}
                      <div className="relative bg-white/95 dark:bg-background/95 backdrop-blur rounded-lg px-3 py-1.5 shadow-md">
                        <span className="font-bold text-brand text-lg leading-none">{formatCurrency(listing.rent_amount)}</span>
                        <span className="text-muted-foreground text-xs">/mo</span>
                      </div>
                      {listing.available_from && new Date(listing.available_from) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                        <Badge className="absolute top-3 left-3 bg-brand text-white text-xs">Available Now</Badge>
                      )}
                    </div>

                    <CardContent className="pt-4 pb-5 space-y-2">
                      <div>
                        <h3 className="font-semibold leading-tight line-clamp-1 group-hover:text-brand transition-colors">
                          {listing.title}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="line-clamp-1">{listing.area ? `${listing.area}, ` : ""}{listing.city}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BedDouble className="h-3.5 w-3.5" />
                          {listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} bed`}
                        </span>
                        <span className="text-border">·</span>
                        <span className="flex items-center gap-1">
                          <Bath className="h-3.5 w-3.5" />
                          {listing.bathrooms} bath
                        </span>
                        {listing.size_sqm && (
                          <>
                            <span className="text-border">·</span>
                            <span>{listing.size_sqm} m²</span>
                          </>
                        )}
                      </div>

                      {listing.amenities?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {(listing.amenities as string[]).slice(0, 3).map((a) => (
                            <Badge key={a} variant="secondary" className="text-xs px-2 py-0">{a}</Badge>
                          ))}
                          {listing.amenities.length > 3 && (
                            <Badge variant="secondary" className="text-xs px-2 py-0">+{listing.amenities.length - 3}</Badge>
                          )}
                        </div>
                      )}

                      <div className="pt-1">
                        <Button size="sm" className="w-full text-xs h-8">View Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer strip */}
      <div className="border-t mt-10 py-6 px-8 text-center text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">© 2026 Keyrai — Property Management Made Simple</Link>
      </div>
    </div>
  );
}
