import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createListing } from "@/app/actions/listings";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewListingPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  // Get vacant units in the org's properties
  const { data: orgProperties } = await supabase
    .from("properties")
    .select("id, name, city")
    .eq("org_id", profile?.org_id ?? "");

  const orgPropertyIds = (orgProperties || []).map((p) => p.id);
  const propertyNameMap = (orgProperties || []).reduce(
    (acc, p) => { acc[p.id] = p.name; return acc; },
    {} as Record<string, string>
  );

  const { data: units } = orgPropertyIds.length
    ? await supabase
        .from("units")
        .select("id, unit_number, property_id, rent_amount, bedrooms, bathrooms")
        .in("property_id", orgPropertyIds)
        .eq("status", "vacant")
        .order("unit_number")
    : { data: [] };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/listings/manage">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Listing</h1>
          <p className="text-muted-foreground text-sm">Post a unit on the marketplace</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 text-sm">
          {decodeURIComponent(error)}
        </div>
      )}

      {!units?.length ? (
        <Card>
          <CardContent className="py-8 text-center space-y-2">
            <p className="text-muted-foreground">
              No vacant units available to list. Add units to your properties first.
            </p>
            <Link href="/properties" className="inline-block pt-2">
              <Button size="sm">Manage Properties</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Listing Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createListing} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Listing Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Spacious 2BR in Downtown"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Unit *</label>
                <select
                  name="unit_id"
                  required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="">Select unit</option>
                  {(units || []).map((u) => (
                    <option key={u.id} value={u.id}>
                      {propertyNameMap[u.property_id]} — Unit {u.unit_number}
                      {u.bedrooms ? ` (${u.bedrooms}BR)` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Monthly Rent *</label>
                  <input
                    type="number"
                    name="rent_amount"
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g. 15000"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Available From</label>
                  <input
                    type="date"
                    name="available_from"
                    defaultValue={today}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Bedrooms</label>
                  <input
                    type="number"
                    name="bedrooms"
                    min="0"
                    defaultValue="1"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    min="0"
                    defaultValue="1"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g. New York"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Neighborhood / Area</label>
                  <input
                    type="text"
                    name="area"
                    placeholder="e.g. Manhattan"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Describe the unit, amenities, nearby transport..."
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit">Publish Listing</Button>
                <Link href="/listings/manage">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
