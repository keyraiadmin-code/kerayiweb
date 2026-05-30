import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createVendor } from "@/app/actions/vendors";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

const CATEGORIES = [
  "plumbing",
  "electrical",
  "hvac",
  "painting",
  "cleaning",
  "landscaping",
  "carpentry",
  "roofing",
  "pest_control",
  "general",
];

export default async function NewVendorPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <Link href="/vendors">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add Vendor</h1>
          <p className="text-muted-foreground text-sm">Add a maintenance or service vendor</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 text-sm">
          {decodeURIComponent(error)}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vendor Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createVendor} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Business Name *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. ABC Plumbing Services"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Category *</label>
              <select
                name="category"
                required
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.replace("_", " ").replace(/^\w/, (s) => s.toUpperCase())}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="vendor@example.com"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                name="notes"
                rows={3}
                placeholder="Specialties, hours, licensing info..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit">Add Vendor</Button>
              <Link href="/vendors">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
