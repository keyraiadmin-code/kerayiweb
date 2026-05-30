"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createListing(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) redirect("/listings/manage/new?error=No+organization+found");

  const title = formData.get("title") as string;
  const unit_id = formData.get("unit_id") as string;
  const rent_amount = parseFloat(formData.get("rent_amount") as string);
  const bedrooms = parseInt(formData.get("bedrooms") as string) || 0;
  const bathrooms = parseInt(formData.get("bathrooms") as string) || 1;
  const city = (formData.get("city") as string) || null;
  const area = (formData.get("area") as string) || null;
  const available_from = (formData.get("available_from") as string) || null;
  const description = (formData.get("description") as string) || null;
  const status = (formData.get("status") as string) || "active";
  const amenities = formData.getAll("amenities") as string[];

  if (!title || !unit_id || !rent_amount) {
    redirect("/listings/manage/new?error=Title,+unit,+and+rent+are+required");
  }

  const { error } = await supabase
    .from("listings")
    .insert({
      org_id: profile.org_id,
      unit_id,
      title,
      rent_amount,
      bedrooms,
      bathrooms,
      city,
      area,
      available_from: available_from || null,
      description,
      status,
      amenities: amenities.length > 0 ? amenities : null,
    });

  if (error) redirect(`/listings/manage/new?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/listings/manage");
  revalidatePath("/listings");
  redirect("/listings/manage");
}
