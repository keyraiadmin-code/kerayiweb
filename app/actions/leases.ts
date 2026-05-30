"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createLease(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) redirect("/leases/new?error=No+organization+found");

  const tenant_id = formData.get("tenant_id") as string;
  const unit_id = formData.get("unit_id") as string;
  const start_date = formData.get("start_date") as string;
  const end_date = formData.get("end_date") as string;
  const rent_amount = parseFloat(formData.get("rent_amount") as string);
  const deposit_amount = parseFloat(formData.get("deposit_amount") as string) || 0;
  const payment_day = parseInt(formData.get("payment_day") as string) || 1;

  if (!tenant_id || !unit_id || !start_date || !end_date || !rent_amount) {
    redirect("/leases/new?error=Please+fill+in+all+required+fields");
  }

  const { data, error } = await supabase
    .from("leases")
    .insert({
      org_id: profile.org_id,
      tenant_id,
      unit_id,
      start_date,
      end_date,
      rent_amount,
      deposit_amount,
      payment_day,
      status: "active",
    })
    .select("id")
    .single();

  if (error) redirect(`/leases/new?error=${encodeURIComponent(error.message)}`);

  // Mark unit as occupied
  await supabase.from("units").update({ status: "occupied" }).eq("id", unit_id);

  revalidatePath("/leases");
  revalidatePath("/tenants");
  redirect("/leases");
}
