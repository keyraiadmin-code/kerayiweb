import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FolderOpen, FileText, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default async function DocumentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.id).single();

  const { data: documents, error } = await supabase
    .from("documents")
    .select("id, name, file_url, file_type, file_size, related_type, created_at")
    .eq("org_id", profile?.org_id ?? "")
    .order("created_at", { ascending: false });

  if (error) console.error("Documents error:", error);

  function formatSize(bytes: number | null): string {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-muted-foreground text-sm">Uploaded leases, IDs, and other documents</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" disabled><FolderOpen className="h-4 w-4" />Upload (coming soon)</Button>
      </div>

      {!documents?.length ? (
        <div className="text-center py-20">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No documents yet</h3>
          <p className="text-muted-foreground">Document uploads will be available soon</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-brand" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.related_type && <span className="capitalize">{doc.related_type} · </span>}
                      {formatSize(doc.file_size)}
                      {doc.file_type && ` · ${doc.file_type}`}
                      {` · ${formatDate(doc.created_at)}`}
                    </p>
                  </div>
                </div>
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-1"><Download className="h-3 w-3" />View</Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
