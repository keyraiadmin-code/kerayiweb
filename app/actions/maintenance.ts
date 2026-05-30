"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
