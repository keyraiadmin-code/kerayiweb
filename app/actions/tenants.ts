"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createTenant(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) {
    redirect("/tenants/new?error=No+organization+found");
  }

  const full_name = formData.get("full_name") as string;
  const email = (formData.get("email") as string) || null;
  const phone = (formData.get("phone") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const id_verified = formData.get("id_verified") === "on";

  const { data, error } = await supabase
    .from("tenants")
    .insert({
      org_id: profile.org_id,
      full_name,
      email: email || null,
      phone: phone || null,
      notes: notes || null,
      id_verified,
      trust_score: 50,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/tenants/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/tenants");
  redirect(`/tenants/${data.id}`);
}
