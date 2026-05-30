import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyForm } from "@/components/app/property-form";

export default async function NewPropertyPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/properties">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add Property</h1>
          <p className="text-muted-foreground text-sm">Enter your property details</p>
        </div>
      </div>

      <PropertyForm error={searchParams.error} />
    </div>
  );
}
