"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const UI_TYPE_MAP: Record<string, string> = {
  apartment: "residential",
  house: "residential",
  commercial: "commercial",
  condo: "residential",
  townhouse: "residential",
  other: "mixed",
};

const SINGLE_UNIT_TYPES = new Set(["house", "condo", "townhouse"]);

export async function createProperty(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) {
    redirect("/properties/new?error=No+organization+found.+Please+set+up+your+account+first.");
  }

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const city = (formData.get("city") as string) || "Addis Ababa";
  const ui_type = (formData.get("ui_type") as string) || "apartment";
  const type = UI_TYPE_MAP[ui_type] || "residential";
  const isSingleUnit = SINGLE_UNIT_TYPES.has(ui_type);
  const total_units = isSingleUnit ? 1 : (parseInt(formData.get("total_units") as string) || 1);
  const description = formData.get("description") as string;

  const { data, error } = await supabase
    .from("properties")
    .insert({
      org_id: profile.org_id,
      owner_id: user.id,
      name,
      address,
      city: city || "Addis Ababa",
      type,
      total_units,
      description: description || null,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/properties/new?error=${encodeURIComponent(error.message)}`);
  }

  // Auto-create a single unit for single-unit property types
  if (isSingleUnit) {
    await supabase.from("units").insert({
      property_id: data.id,
      unit_number: "1",
      bedrooms: 1,
      bathrooms: 1,
      rent_amount: 0,
      status: "vacant",
    });
  }

  revalidatePath("/properties");
  redirect(`/properties/${data.id}`);
}
