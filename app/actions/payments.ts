"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateReceiptNumber } from "@/lib/utils";

export async function approvePayment(paymentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const receiptNumber = generateReceiptNumber();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("payments")
    .update({
      status: "approved",
      paid_date: now.split("T")[0],
      receipt_number: receiptNumber,
      approved_by: user.id,
    })
    .eq("id", paymentId);

  if (error) throw new Error(error.message);
  revalidatePath("/payments");
  revalidatePath(`/payments/${paymentId}`);
  return { receiptNumber };
}

export async function rejectPayment(paymentId: string, reason?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("payments")
    .update({
      status: "rejected",
      notes: reason ?? "Payment rejected",
    })
    .eq("id", paymentId);

  if (error) throw new Error(error.message);
  revalidatePath("/payments");
  revalidatePath(`/payments/${paymentId}`);
}

export async function submitPaymentProof(
  leaseId: string,
  tenantId: string,
  amount: number,
  dueDate: string,
  method: string,
  referenceNumber: string,
  orgId: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("payments").insert({
    lease_id: leaseId,
    tenant_id: tenantId,
    amount,
    due_date: dueDate,
    method,
    reference_number: referenceNumber,
    status: "pending",
    org_id: orgId,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/payments");
}
