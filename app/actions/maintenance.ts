"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateMaintenanceStatus(
  requestId: string,
  status: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const updates: Record<string, string> = { status };
  if (status === "resolved") {
    updates.completed_date = new Date().toISOString().split("T")[0];
  }

  const { error } = await supabase
    .from("maintenance_requests")
    .update(updates)
    .eq("id", requestId);

  if (error) throw new Error(error.message);
  revalidatePath("/maintenance");
  revalidatePath(`/maintenance/${requestId}`);
}

export async function assignVendor(requestId: string, vendorId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("maintenance_requests")
    .update({
      vendor_id: vendorId,
      status: "in_progress",
    })
    .eq("id", requestId);

  if (error) throw new Error(error.message);
  revalidatePath("/maintenance");
  revalidatePath(`/maintenance/${requestId}`);
}

export async function createMaintenanceRequest(data: {
  org_id: string;
  unit_id: string;
  tenant_id?: string;
  title: string;
  description: string;
  priority: string;
  category?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("maintenance_requests").insert({
    ...data,
    status: "open",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/maintenance");
}

export async function createMaintenanceRequestForm(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const org_id = formData.get("org_id") as string;
  const unit_id = formData.get("unit_id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priority = (formData.get("priority") as string) || "medium";
  const category = (formData.get("category") as string) || null;

  const { error } = await supabase.from("maintenance_requests").insert({
    org_id,
    unit_id,
    title,
    description,
    priority,
    category: category || null,
    status: "open",
  });

  if (error) {
    redirect(`/maintenance/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/maintenance");
  redirect("/maintenance");
}
