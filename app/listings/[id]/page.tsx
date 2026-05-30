import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import {
  Home, Bath, BedDouble, MapPin, CheckCircle2, ArrowLeft,
  Calendar, Maximize2, PhoneCall, ClipboardList, Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { ShareButton } from "@/components/app/share-button";

const GRADIENTS = [
  "from-emerald-300/30 via-teal-200/20 to-brand/10",
  "from-blue-300/25 via-sky-200/15 to-indigo-100/20",
  "from-violet-300/25 via-purple-200/15 to-pink-100/20",
  "from-amber-300/25 via-orange-200/15 to-yellow-100/20",
  "from-rose-300/25 via-pink-200/15 to-red-100/20",
  "from-cyan-300/25 via-teal-200/15 to-sky-100/20",
];

function cardGradient(id: string) {
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return GRADIENTS[n % GRADIENTS.length];
}

interface Props { params: Promise<{ id: string }> }

export default async function PublicListingDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .in("status", ["active", "draft"])
    .single();

  if (error || !listing) notFound();

  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://keyrai.app"}/listings/${id}`;

  const COMMON_AMENITIES = [
    "Parking", "Security Guard", "Water Supply", "Electricity Backup",
    "Elevator", "Balcony", "Garden", "Furnished",
    "Air Conditioning", "Internet Ready", "CCTV", "Generator",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8 py-4 bg-background/90 backdrop-blur border-b">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <Home className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-brand">Keyrai</span>
        </Link>
        <div className="flex gap-2">
          <Link href="/listings">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> All Listings
            </Button>
          </Link>
          <Link href="/login"><Button variant="outline" size="sm">Sign In</Button></Link>
        </div>
      </nav>

      {/* Hero image area */}
      <div className={`w-full h-64 sm:h-80 lg:h-96 bg-gradient-to-br ${cardGradient(id)} relative flex items-center justify-center`}>
        <Home className="h-24 w-24 text-brand/15" />
        {/* Price overlay */}
        <div className="absolute bottom-6 left-6 bg-white/95 dark:bg-background/95 backdrop-blur rounded-xl px-5 py-3 shadow-lg">
          <p className="text-3xl font-extrabold text-brand leading-none">{formatCurrency(listing.rent_amount)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">per month</p>
        </div>
        {listing.available_from && new Date(listing.available_from) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
          <Badge className="absolute top-6 left-6 bg-brand text-white">Available Now</Badge>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title + location */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{listing.title}</h1>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>{listing.area ? `${listing.area}, ` : ""}{listing.city}</span>
              </div>
            </div>

            {/* Key details strip */}
            <div className="flex flex-wrap gap-4 py-4 border-y">
              <div className="flex items-center gap-2 text-sm">
                <BedDouble className="h-4 w-4 text-brand" />
                <span className="font-medium">
                  {listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} Bedroom${listing.bedrooms !== 1 ? "s" : ""}`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Bath className="h-4 w-4 text-brand" />
                <span className="font-medium">{listing.bathrooms} Bathroom{listing.bathrooms !== 1 ? "s" : ""}</span>
              </div>
              {listing.size_sqm && (
                <div className="flex items-center gap-2 text-sm">
                  <Maximize2 className="h-4 w-4 text-brand" />
                  <span className="font-medium">{listing.size_sqm} m²</span>
                </div>
              )}
              {listing.available_from && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-brand" />
                  <span className="font-medium">Available {listing.available_from}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <Card>
                <CardHeader><CardTitle className="text-base">About this property</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{listing.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {listing.amenities?.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Amenities</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(listing.amenities as string[]).map((a) => (
                      <div key={a} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-brand flex-shrink-0" />
                        {a}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trust badge */}
            <div className="flex items-center gap-3 bg-brand/5 border border-brand/20 rounded-xl px-4 py-3">
              <CheckCircle2 className="h-5 w-5 text-brand flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Verified by Keyrai</p>
                <p className="text-xs text-muted-foreground">This landlord is verified and their listings are monitored for accuracy.</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Action card */}
            <Card className="border-brand/20 shadow-md">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="text-3xl font-bold text-brand">{formatCurrency(listing.rent_amount)}</p>
                  <p className="text-muted-foreground text-sm">per month</p>
                </div>

                {listing.available_from && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Available from</span>
                    <span className="font-medium ml-auto">{listing.available_from}</span>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <Link href={`/apply/${listing.id}`} className="block">
                    <Button className="w-full gap-2 h-11">
                      <ClipboardList className="h-4 w-4" /> Apply Now
                    </Button>
                  </Link>
                  <Link href={`/apply/${listing.id}?type=showing`} className="block">
                    <Button variant="outline" className="w-full gap-2 h-10">
                      <Eye className="h-4 w-4" /> Request a Showing
                    </Button>
                  </Link>
                  <ShareButton url={publicUrl} title={listing.title} className="w-full gap-2 h-10" />
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  No fees to apply — takes less than 2 minutes
                </p>
              </CardContent>
            </Card>

            {/* Price breakdown */}
            <Card>
              <CardContent className="pt-4 pb-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Cost summary</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly rent</span>
                  <span className="font-medium">{formatCurrency(listing.rent_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Security deposit</span>
                  <span className="font-medium text-muted-foreground">Varies</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-semibold">
                  <span>Move-in estimate</span>
                  <span className="text-brand">~{formatCurrency(listing.rent_amount * 2)}</span>
                </div>
              </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground text-center">
              Powered by <Link href="/" className="text-brand hover:underline">Keyrai</Link> — Property Management Made Simple
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
