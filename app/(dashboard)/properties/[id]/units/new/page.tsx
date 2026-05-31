import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createUnit } from "@/app/actions/units";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: { error?: string };
}

export default async function NewUnitPage({ params, searchParams }: Props) {
  const { id: propertyId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: property } = await supabase
    .from("properties")
    .select("id, name")
    .eq("id", propertyId)
    .single();

  if (!property) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/properties/${propertyId}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add Unit</h1>
          <p className="text-muted-foreground text-sm">{property.name}</p>
        </div>
      </div>

      {searchParams.error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {searchParams.error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Unit Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createUnit} className="space-y-5">
            <input type="hidden" name="property_id" value={propertyId} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="unit_number">
                  Unit Number <span className="text-destructive">*</span>
                </label>
                <input
                  id="unit_number"
                  name="unit_number"
                  type="text"
                  required
                  placeholder="e.g. 101, A, Ground Floor"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="floor">
                  Floor{" "}
                  <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <input
                  id="floor"
                  name="floor"
                  type="number"
                  placeholder="e.g. 1"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="unit_type">Unit Type</label>
              <select
                id="unit_type"
                name="unit_type"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="residential">Residential</option>
                <option value="shop">Shop / Retail</option>
                <option value="office">Office</option>
                <option value="cafe">Café / Restaurant</option>
                <option value="parking">Parking</option>
                <option value="warehouse">Warehouse</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="bedrooms">Bedrooms</label>
                <input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  min="0"
                  defaultValue="1"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="bathrooms">Bathrooms</label>
                <input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  min="0"
                  defaultValue="1"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="size_sqm">
                  Size (m²){" "}
                  <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <input
                  id="size_sqm"
                  name="size_sqm"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="e.g. 45"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="rent_amount">
                Monthly Rent (ETB) <span className="text-destructive">*</span>
              </label>
              <input
                id="rent_amount"
                name="rent_amount"
                type="number"
                min="0"
                step="1"
                defaultValue="0"
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="description">
                Description{" "}
                <span className="text-muted-foreground text-xs">(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={2}
                placeholder="Any notes about this unit..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="submit" className="flex-1">Add Unit</Button>
              <Link href={`/properties/${propertyId}`}>
                <Button type="button" variant="outline" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
