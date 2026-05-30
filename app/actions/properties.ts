"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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
    redirect("/properties/new?error=No+organization+found");
  }

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const city = (formData.get("city") as string) || "Addis Ababa";
  const type = formData.get("type") as string;
  const total_units = parseInt(formData.get("total_units") as string) || 1;
  const description = formData.get("description") as string;

  const { data, error } = await supabase.from("properties").insert({
    org_id: profile.org_id,
    owner_id: user.id,
    name,
    address,
    city,
    type,
    total_units,
    description: description || null,
  }).select("id").single();

  if (error) {
    redirect(`/properties/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/properties");
  redirect(`/properties/${data.id}`);
}
