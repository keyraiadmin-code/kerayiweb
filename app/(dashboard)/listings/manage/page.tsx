import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ListFilter, Plus, Home, Eye, Sparkles, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const STATUS_COLORS: Record<string, "success" | "secondary" | "warning" | "destructive" | "info"> = {
  active: "success",
  draft: "secondary",
  paused: "warning",
  rented: "info",
  expired: "destructive",
};

export default async function ManageListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  // Fetch listings (all statuses for landlord)
  let listingsQuery = supabase
    .from("listings")
    .select("id, title, rent_amount, bedrooms, bathrooms, city, area, status, available_from, unit_id")
    .eq("org_id", profile?.org_id ?? "")
    .order("created_at", { ascending: false });

  if (status && status !== "all") listingsQuery = listingsQuery.eq("status", status);

  const { data: listings, error } = await listingsQuery;
  if (error) console.error("Listings error:", error);

  // Counts per status for tabs
  const { data: allListings } = await supabase
    .from("listings")
    .select("status")
    .eq("org_id", profile?.org_id ?? "");

  const counts = (allListings || []).reduce((acc: Record<string, number>, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    acc.all = (acc.all ?? 0) + 1;
    return acc;
  }, {});

  // Vacant units without an active listing — "Ready to List"
  const { data: orgProperties } = await supabase
    .from("properties")
    .select("id, name")
    .eq("org_id", profile?.org_id ?? "");

  const orgPropertyIds = (orgProperties || []).map((p) => p.id);
  const propertyNameMap = (orgProperties || []).reduce(
    (acc: Record<string, string>, p) => { acc[p.id] = p.name; return acc; },
    {}
  );

  const { data: vacantUnits } = orgPropertyIds.length
    ? await supabase
        .from("units")
        .select("id, unit_number, property_id")
        .in("property_id", orgPropertyIds)
        .eq("status", "vacant")
    : { data: [] };

  // Units that already have an active/draft listing
  const listedUnitIds = new Set(
    (allListings || []).map((l) => (l as unknown as { unit_id?: string }).unit_id).filter(Boolean)
  );
  const readyToList = (vacantUnits || []).filter((u) => !listedUnitIds.has(u.id));

  const STATUS_TABS = ["all", "active", "draft", "paused", "rented", "expired"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-muted-foreground text-sm">Manage your properties on the marketplace</p>
        </div>
        <div className="flex gap-2">
          <Link href="/listings" target="_blank">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" /> View Marketplace
            </Button>
          </Link>
          <Link href="/listings/manage/new">
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" /> New Listing
            </Button>
          </Link>
        </div>
      </div>

      {/* Vacant units ready to list */}
      {readyToList.length > 0 && (
        <div className="bg-brand/5 border border-brand/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 text-brand" />
            </div>
            <div>
              <p className="font-semibold text-sm">Vacant Properties Ready to List</p>
              <p className="text-xs text-muted-foreground">
                {readyToList.length} vacant unit{readyToList.length !== 1 ? "s" : ""} not yet on the marketplace
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {readyToList.map((unit) => (
              <Link key={unit.id} href={`/listings/manage/new?unit_id=${unit.id}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-brand hover:text-white hover:border-brand transition-colors px-3 py-1.5 gap-1.5 text-xs"
                >
                  <Plus className="h-3 w-3" />
                  {propertyNameMap[unit.property_id]} · Unit {unit.unit_number}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Status tabs */}
      {(counts.all ?? 0) > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_TABS.map((s) => (
            <Link key={s} href={s === "all" ? "/listings/manage" : `/listings/manage?status=${s}`}>
              <Button
                variant={(!status && s === "all") || status === s ? "default" : "outline"}
                size="sm"
                className="capitalize gap-1.5"
              >
                {s.replace("_", " ")}
                {counts[s] ? (
                  <span className="text-xs opacity-70">({counts[s]})</span>
                ) : null}
              </Button>
            </Link>
          ))}
        </div>
      )}

      {/* Listings grid */}
      {!listings?.length ? (
        <div className="text-center py-20">
          <ListFilter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No listings yet</h3>
          <p className="text-muted-foreground mb-4">
            {status && status !== "all"
              ? `No ${status} listings`
              : "Create a listing to attract tenants on the marketplace"}
          </p>
          <Link href="/listings/manage/new">
            <Button><Plus className="h-4 w-4 mr-2" />New Listing</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((listing) => (
            <Card key={listing.id} className="hover:shadow-md transition-shadow group overflow-hidden">
              <div className="h-36 bg-gradient-to-br from-brand/15 to-brand/5 flex items-center justify-center relative">
                <Home className="h-10 w-10 text-brand/30" />
                <Badge
                  variant={STATUS_COLORS[listing.status] ?? "secondary"}
                  className="absolute top-3 right-3 capitalize"
                >
                  {listing.status}
                </Badge>
              </div>
              <CardContent className="pt-4 space-y-3">
                <div>
                  <p className="font-semibold leading-tight line-clamp-1">{listing.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {listing.area ? `${listing.area}, ` : ""}{listing.city}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms}BR`}</span>
                  <span>·</span>
                  <span>{listing.bathrooms}BA</span>
                </div>
                <p className="font-bold text-brand">
                  {formatCurrency(listing.rent_amount)}
                  <span className="font-normal text-muted-foreground text-xs">/mo</span>
                </p>
                {listing.available_from && (
                  <p className="text-xs text-muted-foreground">Available: {listing.available_from}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <Link href={`/listings/${listing.id}`} target="_blank" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      <Eye className="h-3 w-3" /> Preview
                    </Button>
                  </Link>
                  <Link href={`/listings/manage/new?edit=${listing.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Edit</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
