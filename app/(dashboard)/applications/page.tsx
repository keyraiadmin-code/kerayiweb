import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.id).single();

  const { data: applications, error } = await supabase
    .from("applications")
    .select("id, applicant_name, applicant_email, applicant_phone, monthly_income, move_in_date, status, created_at, unit_id, listing_id")
    .eq("org_id", profile?.org_id ?? "")
    .order("created_at", { ascending: false });

  if (error) console.error("Applications error:", error);

  const statusColors: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
    approved: "success",
    pending: "warning",
    rejected: "destructive",
    withdrawn: "secondary",
  };

  async function approveApp(id: string) {
    "use server";
    const s = await createClient();
    await s.from("applications").update({ status: "approved" }).eq("id", id);
  }

  async function rejectApp(id: string) {
    "use server";
    const s = await createClient();
    await s.from("applications").update({ status: "rejected" }).eq("id", id);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Applications</h1>
        <p className="text-muted-foreground text-sm">Rental applications from prospective tenants</p>
      </div>

      {!applications?.length ? (
        <div className="text-center py-20">
          <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No applications yet</h3>
          <p className="text-muted-foreground">Applications submitted through your listings will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{app.applicant_name}</p>
                      <Badge variant={statusColors[app.status] ?? "secondary"}>{app.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{app.applicant_email}</p>
                    {app.applicant_phone && <p className="text-sm text-muted-foreground">{app.applicant_phone}</p>}
                    <div className="flex gap-4 text-sm mt-2">
                      {app.monthly_income && (
                        <span className="text-muted-foreground">Income: <span className="text-foreground font-medium">{formatCurrency(app.monthly_income)}/mo</span></span>
                      )}
                      {app.move_in_date && (
                        <span className="text-muted-foreground">Move-in: <span className="text-foreground font-medium">{formatDate(app.move_in_date)}</span></span>
                      )}
                      <span className="text-muted-foreground">Applied: <span className="text-foreground font-medium">{formatDate(app.created_at)}</span></span>
                    </div>
                  </div>
                  {app.status === "pending" && (
                    <div className="flex gap-2 flex-shrink-0">
                      <form action={approveApp.bind(null, app.id)}>
                        <Button size="sm" className="gap-1"><CheckCircle2 className="h-3 w-3" />Approve</Button>
                      </form>
                      <form action={rejectApp.bind(null, app.id)}>
                        <Button size="sm" variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Reject</Button>
                      </form>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
