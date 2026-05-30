import Link from "next/link";
import {
  Building2, Users, CreditCard, Wrench, ShieldCheck,
  QrCode, BarChart3, Globe, ArrowRight, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Building2,
    title: "Property Management",
    desc: "Manage all your properties and units from one clean dashboard.",
  },
  {
    icon: Users,
    title: "Tenant Tracking",
    desc: "Keep detailed tenant records with trust scores and lease history.",
  },
  {
    icon: CreditCard,
    title: "Digital Payments",
    desc: "Record and approve rent payments with automatic receipt generation.",
  },
  {
    icon: QrCode,
    title: "QR Receipts",
    desc: "Generate verifiable QR-coded receipts tenants can scan and trust.",
  },
  {
    icon: Wrench,
    title: "Maintenance",
    desc: "Track repair requests and assign them to vendors instantly.",
  },
  {
    icon: BarChart3,
    title: "Reports",
    desc: "Understand your portfolio with occupancy and revenue analytics.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by Default",
    desc: "Row-level security ensures your data stays private and protected.",
  },
  {
    icon: Globe,
    title: "Multi-language",
    desc: "Full English and Amharic language support built in.",
  },
];

const benefits = [
  "No more paper receipts",
  "Reduce late payments",
  "Works on any device",
  "Free for small portfolios",
  "Easy tenant onboarding",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-brand">Keyrai</span>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Link href="/listings" className="hidden sm:block">
            <Button variant="ghost" size="sm">Browse Listings</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-16 sm:py-24 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-brand/10 text-brand rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <CheckCircle2 className="h-4 w-4" />
          Property Management Made Simple
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-6">
          Manage Your Rentals
          <br />
          <span className="text-brand">With Confidence</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Keyrai digitizes your rental business — from payments and receipts to
          tenant records and maintenance tracking. Everything in one place.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Start Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/listings">
            <Button variant="outline" size="lg">Browse Properties</Button>
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-10">
          {benefits.map((b) => (
            <div key={b} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-brand flex-shrink-0" />
              {b}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            Everything you need to manage rentals
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-brand" />
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          Ready to digitize your rentals?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Join landlords and property managers already using Keyrai to save time,
          reduce disputes, and get paid on time.
        </p>
        <Link href="/signup">
          <Button size="lg" className="gap-2">
            Create Free Account <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6 text-center text-sm text-muted-foreground">
        <p>© 2026 Keyrai — Property Management Made Simple</p>
      </footer>
    </div>
  );
}
