"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ full_name: "", phone: "" });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase.from("profiles").select("full_name, phone").eq("id", user.id).single();
      if (data) setProfile({ full_name: data.full_name ?? "", phone: data.phone ?? "" });
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("profiles").update({ full_name: profile.full_name, phone: profile.phone }).eq("id", userId);
      if (error) throw error;
      toast({ title: "Settings saved", description: "Your profile has been updated." });
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-brand" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} placeholder="Abebe Kebede" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+251 91 234 5678" />
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Use the theme toggle in the top bar to switch between light and dark mode. Language can be changed with the language switcher.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Connect payment providers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[{ name: "Chapa", desc: "Accept Telebirr, CBE, and bank transfers", status: "Coming soon" },
            { name: "Telebirr", desc: "Direct Telebirr integration", status: "Coming soon" },
            { name: "Resend", desc: "Email notifications for tenants", status: "Coming soon" },
          ].map(({ name, desc, status }) => (
            <div key={name} className="flex items-center justify-between py-2 border-b last:border-0">
              <div><p className="font-medium">{name}</p><p className="text-sm text-muted-foreground">{desc}</p></div>
              <Button variant="outline" size="sm" disabled>{status}</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
