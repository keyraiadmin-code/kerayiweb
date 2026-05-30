import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createListing } from "@/app/actions/listings";

const AMENITIES = [
  "Parking", "Security Guard", "Water Supply", "Electricity Backup",
  "Elevator", "Balcony", "Garden", "Furnished",
  "Air Conditioning", "Internet Ready", "CCTV", "Generator",
  "Swimming Pool", "Gym", "Laundry", "Pet Friendly",
];

interface Props {
  searchParams: Promise<{ error?: string; unit_id?: string }>;
}

export default async function NewListingPage({ searchParams }: Props) {
  const { error, unit_id: preselectedUnitId } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  const { data: orgProperties } = await supabase
    .from("properties")
    .select("id, name, city")
    .eq("org_id", profile?.org_id ?? "");

  const orgPropertyIds = (orgProperties || []).map((p) => p.id);
  const propertyMap = (orgProperties || []).reduce(
    (acc: Record<string, { name: string; city: string | null }>, p) => {
      acc[p.id] = { name: p.name, city: p.city };
      return acc;
    },
    {}
  );

  const { data: units } = orgPropertyIds.length
    ? await supabase
        .from("units")
        .select("id, unit_number, property_id, rent_amount, bedrooms, bathrooms")
        .in("property_id", orgPropertyIds)
        .in("status", ["vacant", "available"])
        .order("unit_number")
    : { data: [] };

  // Pre-selected unit details
  const preselectedUnit = preselectedUnitId ? (units || []).find((u) => u.id === preselectedUnitId) : null;
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/listings/manage">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Listing</h1>
          <p className="text-muted-foreground text-sm">Publish a vacant unit to the marketplace</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 text-sm">
          {decodeURIComponent(error)}
        </div>
      )}

      {preselectedUnit && (
        <div className="flex items-center gap-2 bg-brand/5 border border-brand/20 rounded-lg px-4 py-2.5">
          <Sparkles className="h-4 w-4 text-brand flex-shrink-0" />
          <p className="text-sm">
            Pre-filled from{" "}
            <span className="font-semibold">
              {propertyMap[preselectedUnit.property_id]?.name} — Unit {preselectedUnit.unit_number}
            </span>
          </p>
        </div>
      )}

      {!units?.length ? (
        <Card>
          <CardContent className="py-8 text-center space-y-2">
            <p className="text-muted-foreground">No vacant units available to list. Add units to your properties first.</p>
            <Link href="/properties" className="inline-block pt-2">
              <Button size="sm">Manage Properties</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <form action={createListing} className="space-y-5">
          {/* Publishing status */}
          <Card>
            <CardHeader><CardTitle className="text-base">Publishing</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                {[
                  { value: "active", label: "Publish Now", desc: "Visible to renters immediately" },
                  { value: "draft", label: "Save as Draft", desc: "Only visible to you" },
                ].map((opt) => (
                  <label key={opt.value} className="flex-1 flex items-start gap-3 border rounded-lg p-3 cursor-pointer has-[:checked]:border-brand has-[:checked]:bg-brand/5 transition-colors">
                    <input type="radio" name="status" value={opt.value} defaultChecked={opt.value === "active"} className="mt-0.5 accent-brand" />
                    <div>
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Core details */}
          <Card>
            <CardHeader><CardTitle className="text-base">Property Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Listing Title *</label>
                <input
                  type="text" name="title" required
                  defaultValue={preselectedUnit ? `${preselectedUnit.bedrooms === 0 ? "Studio" : `${preselectedUnit.bedrooms}BR`} in ${propertyMap[preselectedUnit.property_id]?.city ?? ""}`.trim() : ""}
                  placeholder="e.g. Spacious 2BR with Parking in Bole"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Unit *</label>
                <select name="unit_id" required
                  defaultValue={preselectedUnitId ?? ""}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="">Select unit</option>
                  {(units || []).map((u) => (
                    <option key={u.id} value={u.id}>
                      {propertyMap[u.property_id]?.name} — Unit {u.unit_number}
                      {u.bedrooms != null ? ` (${u.bedrooms === 0 ? "Studio" : `${u.bedrooms}BR`})` : ""}
                      {u.rent_amount ? ` · ${u.rent_amount}/mo` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Monthly Rent (ETB) *</label>
                  <input
                    type="number" name="rent_amount" required min="0" step="0.01"
                    defaultValue={preselectedUnit?.rent_amount ?? ""}
                    placeholder="e.g. 15000"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Available From</label>
                  <input type="date" name="available_from" defaultValue={today}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Bedrooms</label>
                  <select name="bedrooms"
                    defaultValue={preselectedUnit?.bedrooms ?? 1}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="0">Studio</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n} Bedroom{n !== 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Bathrooms</label>
                  <select name="bathrooms"
                    defaultValue={preselectedUnit?.bathrooms ?? 1}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">City</label>
                  <input type="text" name="city"
                    defaultValue={preselectedUnit ? propertyMap[preselectedUnit.property_id]?.city ?? "" : ""}
                    placeholder="e.g. Addis Ababa"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Neighbourhood</label>
                  <input type="text" name="area" placeholder="e.g. Bole, Kazanchis"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <textarea name="description" rows={4}
                  placeholder="Describe the property, nearby landmarks, transport links, special features…"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader><CardTitle className="text-base">Amenities</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AMENITIES.map((a) => (
                  <label key={a} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-md hover:bg-muted transition-colors">
                    <input type="checkbox" name="amenities" value={a} className="accent-brand rounded" />
                    {a}
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit">Publish Listing</Button>
            <Link href="/listings/manage">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
