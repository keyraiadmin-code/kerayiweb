"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createUnit(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const property_id = formData.get("property_id") as string;
  const unit_number = formData.get("unit_number") as string;
  const floorRaw = formData.get("floor") as string;
  const floor = floorRaw ? parseInt(floorRaw) : null;
  const bedrooms = parseInt(formData.get("bedrooms") as string) || 1;
  const bathrooms = parseInt(formData.get("bathrooms") as string) || 1;
  const sizeRaw = formData.get("size_sqm") as string;
  const size_sqm = sizeRaw ? parseFloat(sizeRaw) : null;
  const rent_amount = parseFloat(formData.get("rent_amount") as string) || 0;
  const description = formData.get("description") as string;

  const { error } = await supabase.from("units").insert({
    property_id,
    unit_number,
    floor,
    bedrooms,
    bathrooms,
    size_sqm,
    rent_amount,
    description: description || null,
    status: "vacant",
  });

  if (error) {
    redirect(
      `/properties/${property_id}/units/new?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(`/properties/${property_id}`);
  redirect(`/properties/${property_id}`);
}
