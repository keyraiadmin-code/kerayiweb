import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Wrench, Plus, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string }>;
}) {
  const { status, priority } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  let query = supabase
    .from("maintenance_requests")
    .select("id, title, description, priority, status, category, created_at, unit_id")
    .eq("org_id", profile?.org_id ?? "")
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);
  if (priority && priority !== "all") query = query.eq("priority", priority);

  const { data: requests, error } = await query;
  if (error) console.error("Maintenance fetch error:", error);

  const unitIds = Array.from(new Set((requests || []).map((r) => r.unit_id)));
  const { data: units } = unitIds.length
    ? await supabase.from("units").select("id, unit_number, property_id, properties(name)").in("id", unitIds)
    : { data: [] };

  const unitMap = (units || []).reduce(
    (acc: Record<string, { id: string; unit_number: string; property_id: string; properties: { name: string }[] | null }>, u) => {
      acc[u.id] = u;
      return acc;
    },
    {}
  );

  const priorityColors: Record<string, "destructive" | "warning" | "info" | "secondary"> = {
    urgent: "destructive", high: "warning", medium: "info", low: "secondary",
  };
  const statusColors: Record<string, "success" | "warning" | "info" | "secondary"> = {
    resolved: "success", open: "warning", in_progress: "info", closed: "secondary",
  };

  const statuses = ["all", "open", "in_progress", "resolved", "closed"];
  const priorities = ["all", "urgent", "high", "medium", "low"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Maintenance</h1>
          <p className="text-muted-foreground text-sm">Track and manage maintenance requests</p>
        </div>
        <Link href="/maintenance/new">
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />New Request
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground self-center">Status:</span>
          {statuses.map((s) => (
            <Link key={s} href={`/maintenance?status=${s}${priority ? `&priority=${priority}` : ""}`}>
              <Button variant={(!status && s === "all") || status === s ? "default" : "outline"} size="sm" className="capitalize">
                {s.replace("_", " ")}
              </Button>
            </Link>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground self-center">Priority:</span>
          {priorities.map((p) => (
            <Link key={p} href={`/maintenance?${status ? `status=${status}&` : ""}priority=${p}`}>
              <Button variant={(!priority && p === "all") || priority === p ? "default" : "outline"} size="sm" className="capitalize">
                {p}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {!requests?.length ? (
        <div className="text-center py-20">
          <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No maintenance requests</h3>
          <p className="text-muted-foreground">All clear!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const unit = unitMap[req.unit_id];
            const rawProperties = unit?.properties;
            const propertyName = Array.isArray(rawProperties) && rawProperties.length > 0
              ? (rawProperties[0] as { name: string }).name
              : typeof rawProperties === 'object' && rawProperties !== null && !Array.isArray(rawProperties)
                ? (rawProperties as { name: string }).name
                : undefined;
            return (
              <Link key={req.id} href={`/maintenance/${req.id}`}>
                <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                  <CardContent className="flex items-start justify-between py-4 gap-4">
                    <div className="flex items-start gap-3">
                      {req.priority === "urgent" && <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />}
                      <div className="space-y-1">
                        <p className="font-medium">{req.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{req.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {propertyName && `${propertyName} · `}
                          {unit?.unit_number && `Unit ${unit.unit_number} · `}
                          {formatDate(req.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={priorityColors[req.priority] ?? "secondary"}>{req.priority}</Badge>
                      <Badge variant={statusColors[req.status] ?? "secondary"}>{req.status.replace("_", " ")}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
