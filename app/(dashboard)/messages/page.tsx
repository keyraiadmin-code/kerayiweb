import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MessageSquare, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.id).single();

  const { data: threads } = await supabase
    .from("message_threads")
    .select("id, subject, created_at")
    .eq("org_id", profile?.org_id ?? "")
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground text-sm">Communicate with tenants and vendors</p>
      </div>

      {!threads?.length ? (
        <div className="text-center py-20">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No messages yet</h3>
          <p className="text-muted-foreground">Messaging is available — conversations will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((thread) => (
            <Card key={thread.id} className="hover:shadow-sm cursor-pointer transition-shadow">
              <CardContent className="py-3">
                <p className="font-medium">{thread.subject ?? "General"}</p>
                <p className="text-xs text-muted-foreground">{thread.created_at.split("T")[0]}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
