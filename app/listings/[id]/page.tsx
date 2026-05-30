import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Building2, MapPin, Home, Bath, Maximize, CheckCircle2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface Props { params: Promise<{ id: string }> }

export default async function PublicListingDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (error || !listing) notFound();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-brand">Keyrai</span>
        </Link>
        <div className="flex gap-2">
          <Link href="/listings"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />All Listings</Button></Link>
          <Link href="/login"><Button variant="outline" size="sm">Sign In</Button></Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        {/* Hero image placeholder */}
        <div className="h-64 bg-gradient-to-br from-brand/20 to-gold/10 rounded-xl flex items-center justify-center">
          <Home className="h-20 w-20 text-brand/30" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h1 className="text-2xl font-bold">{listing.title}</h1>
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {listing.area ? `${listing.area}, ` : ""}{listing.city}
              </p>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1"><Home className="h-4 w-4 text-brand" />{listing.bedrooms} Bedrooms</span>
              <span className="flex items-center gap-1"><Bath className="h-4 w-4 text-brand" />{listing.bathrooms} Bathrooms</span>
              {listing.size_sqm && <span className="flex items-center gap-1"><Maximize className="h-4 w-4 text-brand" />{listing.size_sqm} m²</span>}
            </div>

            {listing.description && (
              <Card>
                <CardHeader><CardTitle className="text-base">About this property</CardTitle></CardHeader>
                <CardContent><p className="text-sm leading-relaxed">{listing.description}</p></CardContent>
              </Card>
            )}

            {listing.amenities?.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Amenities</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {listing.amenities.map((a: string) => (
                      <div key={a} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-brand flex-shrink-0" />
                        {a}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="text-3xl font-bold text-brand">{formatCurrency(listing.rent_amount)}</p>
                  <p className="text-muted-foreground text-sm">per month</p>
                </div>
                {listing.available_from && (
                  <div>
                    <p className="text-sm text-muted-foreground">Available from</p>
                    <p className="font-medium">{listing.available_from}</p>
                  </div>
                )}
                <Link href={`/apply/${listing.id}`} className="block">
                  <Button className="w-full">Apply Now</Button>
                </Link>
                <p className="text-xs text-muted-foreground text-center">
                  You&apos;ll be asked for some basic information
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-brand" />
                  <span>Verified by Keyrai</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
