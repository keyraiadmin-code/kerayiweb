import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createTenant } from "@/app/actions/tenants";

interface Props {
  searchParams: { error?: string };
}

export default async function NewTenantPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/tenants">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add Tenant</h1>
          <p className="text-muted-foreground text-sm">Enter tenant details</p>
        </div>
      </div>

      {searchParams.error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {searchParams.error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tenant Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createTenant} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="full_name">
                Full Name <span className="text-destructive">*</span>
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                placeholder="e.g. Abebe Kebede"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="email">
                  Email <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tenant@email.com"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="phone">
                  Phone <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+251 91 234 5678"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="national_id">
                National ID / Passport <span className="text-muted-foreground text-xs">(optional)</span>
              </label>
              <input
                id="national_id"
                name="national_id"
                type="text"
                placeholder="ID number"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="notes">
                Notes <span className="text-muted-foreground text-xs">(optional)</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Any notes about this tenant..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="id_verified"
                name="id_verified"
                type="checkbox"
                className="h-4 w-4 rounded border-input accent-brand"
              />
              <label htmlFor="id_verified" className="text-sm font-medium cursor-pointer">
                ID Verified
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="submit" className="flex-1">Add Tenant</Button>
              <Link href="/tenants">
                <Button type="button" variant="outline" className="w-full sm:w-auto">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
