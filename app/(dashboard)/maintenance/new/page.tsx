import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MaintenanceForm } from "@/components/app/maintenance-form";

interface Props {
  searchParams: { error?: string };
}

export default async function NewMaintenancePage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  const { data: properties } = await supabase
    .from("properties")
    .select("id, name")
    .eq("org_id", profile?.org_id ?? "")
    .order("name");

  const propertyIds = (properties || []).map((p) => p.id);
  const { data: units } = propertyIds.length
    ? await supabase
        .from("units")
        .select("id, unit_number, property_id")
        .in("property_id", propertyIds)
        .order("unit_number")
    : { data: [] };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/maintenance">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Work Order</h1>
          <p className="text-muted-foreground text-sm">Submit a maintenance request</p>
        </div>
      </div>

      {searchParams.error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {searchParams.error}
        </div>
      )}

      <MaintenanceForm
        properties={properties || []}
        units={units || []}
        orgId={profile?.org_id ?? ""}
      />
    </div>
  );
}
