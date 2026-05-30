"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface Props { params: Promise<{ id: string }> }

export default function ApplyPage({ params }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    applicant_name: "",
    applicant_email: "",
    applicant_phone: "",
    monthly_income: "",
    move_in_date: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { id } = await params;
      const supabase = createClient();

      // Get listing to find org_id
      const { data: listing } = await supabase.from("listings").select("org_id, unit_id").eq("id", id).single();
      if (!listing) throw new Error("Listing not found");

      const { error } = await supabase.from("applications").insert({
        listing_id: id,
        unit_id: listing.unit_id,
        org_id: listing.org_id,
        applicant_name: form.applicant_name,
        applicant_email: form.applicant_email,
        applicant_phone: form.applicant_phone || null,
        monthly_income: form.monthly_income ? parseFloat(form.monthly_income) : null,
        move_in_date: form.move_in_date || null,
        notes: form.notes || null,
        status: "pending",
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to submit", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-brand mx-auto" />
            <h2 className="text-2xl font-bold">Application Submitted!</h2>
            <p className="text-muted-foreground">The landlord will review your application and get back to you.</p>
            <Link href="/listings"><Button variant="outline">Browse More Listings</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-brand">Keyrai</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rental Application</CardTitle>
            <CardDescription>Please fill in your details to apply for this property</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" value={form.applicant_name} onChange={(e) => setForm({ ...form, applicant_name: e.target.value })} required placeholder="Abebe Kebede" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" type="email" value={form.applicant_email} onChange={(e) => setForm({ ...form, applicant_email: e.target.value })} required placeholder="abebe@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={form.applicant_phone} onChange={(e) => setForm({ ...form, applicant_phone: e.target.value })} placeholder="+251 91 234 5678" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income">Monthly Income (ETB)</Label>
                <Input id="income" type="number" value={form.monthly_income} onChange={(e) => setForm({ ...form, monthly_income: e.target.value })} placeholder="25000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="moveIn">Desired Move-in Date</Label>
                <Input id="moveIn" type="date" value={form.move_in_date} onChange={(e) => setForm({ ...form, move_in_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Tell the landlord a bit about yourself..." rows={3} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
