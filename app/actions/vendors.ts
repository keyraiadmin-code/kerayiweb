"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createVendor(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) redirect("/vendors/new?error=No+organization+found");

  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const phone = (formData.get("phone") as string) || null;
  const email = (formData.get("email") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  if (!name || !category) {
    redirect("/vendors/new?error=Name+and+category+are+required");
  }

  const { error } = await supabase
    .from("vendors")
    .insert({
      org_id: profile.org_id,
      name,
      category,
      phone,
      email,
      notes,
      active: true,
      rating: 0,
    });

  if (error) redirect(`/vendors/new?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/vendors");
  redirect("/vendors");
}
