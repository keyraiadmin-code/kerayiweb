import Link from "next/link";
import {
  Building2, Users, CreditCard, Wrench, ShieldCheck,
  QrCode, BarChart3, Globe, ArrowRight, CheckCircle2,
  Home, Zap, Lock, Smartphone, Bell, FileText,
  FileSignature, ListFilter, BarChart2, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  { icon: Building2, title: "Property Management", desc: "Manage all properties and units from one clean dashboard with full occupancy tracking." },
  { icon: Users, title: "Tenant Portal", desc: "Keep detailed tenant records with trust scores, ID verification, and lease history." },
  { icon: CreditCard, title: "Online Rent Collection", desc: "Record and approve payments with automatic receipt generation and late-fee tracking." },
  { icon: QrCode, title: "Digital QR Receipts", desc: "Generate verifiable QR-coded receipts tenants can scan, download, and trust." },
  { icon: Wrench, title: "Maintenance Requests", desc: "Track repair requests from submission to resolution, assign to vendors instantly." },
  { icon: FileSignature, title: "Lease Builder", desc: "Create and manage lease agreements. E-signatures and document storage included." },
  { icon: ListFilter, title: "Listing Marketplace", desc: "Publish vacant units to the Keyrai marketplace and receive tenant inquiries." },
  { icon: BarChart2, title: "Reports & Analytics", desc: "Understand your portfolio with revenue, occupancy, and expense reports." },
  { icon: ShieldCheck, title: "Tenant Screening", desc: "Run credit, criminal, and eviction checks before signing a lease." },
  { icon: Bell, title: "Auto Reminders", desc: "Automatic rent due date reminders sent to tenants so you don't have to chase." },
  { icon: Smartphone, title: "Mobile First", desc: "Full-featured experience on any screen — phone, tablet, or desktop." },
  { icon: Lock, title: "Secure by Default", desc: "Row-level security ensures your data and your tenants' data stay private." },
];

const steps = [
  { n: "1", title: "Add your properties", desc: "Set up your portfolio by adding properties and individual units in minutes." },
  { n: "2", title: "Invite or onboard tenants", desc: "Add tenants, create leases, and set up automatic rent reminders." },
  { n: "3", title: "Get paid and stay organised", desc: "Record payments, generate receipts, and track maintenance from your phone." },
];

const plans = [
  {
    name: "Free",
    price: "ETB 0",
    period: "forever",
    desc: "Perfect for individual landlords just getting started.",
    highlight: false,
    features: [
      "Up to 5 units",
      "Unlimited tenants",
      "Payment recording & receipts",
      "Maintenance requests",
      "1 property listing",
      "Basic reports",
    ],
    cta: "Start Free",
    href: "/signup",
  },
  {
    name: "Pro",
    price: "ETB 299",
    period: "per month",
    desc: "For growing portfolios that need the full feature set.",
    highlight: true,
    features: [
      "Unlimited units & properties",
      "Unlimited listings",
      "Tenant screening & background checks",
      "Lease builder + e-signatures",
      "Document storage",
      "Auto-reminders & autopay",
      "Priority support",
      "Advanced analytics",
    ],
    cta: "Start Pro — 14 days free",
    href: "/signup?plan=pro",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4 bg-background/90 backdrop-blur border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center flex-shrink-0">
            <Home className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-brand">Keyrai</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/listings" className="hover:text-foreground transition-colors">Browse Listings</Link>
        </div>
        <div className="flex gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="gap-1">Get Started <ArrowRight className="h-3 w-3" /></Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-8 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand/5 rounded-full blur-3xl" />
        </div>
        <Badge variant="outline" className="mb-6 gap-2 border-brand/30 text-brand bg-brand/5 text-xs">
          <Zap className="h-3 w-3" /> Free for small portfolios — no credit card required
        </Badge>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1]">
          Manage Rentals.{" "}
          <span className="text-brand">Find Tenants.</span>
          <br className="hidden sm:block" />
          {" "}Get Paid — On Time.
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Keyrai is the all-in-one platform for landlords and property managers.
          Track payments, manage maintenance, and list vacant units — from any device.
        </p>
        <div className="flex gap-4 justify-center flex-wrap mb-16">
          <Link href="/signup">
            <Button size="lg" className="gap-2 px-8 h-12 text-base">
              Start for Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/listings">
            <Button variant="outline" size="lg" className="h-12 text-base">
              Browse Properties
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
          {[
            { label: "Landlords", value: "500+" },
            { label: "Units Managed", value: "2,000+" },
            { label: "Payments Processed", value: "ETB 50M+" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-brand">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-muted/30 py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything in one platform</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              From finding tenants to collecting rent — Keyrai handles the full rental lifecycle.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="hover:shadow-md transition-shadow border-border/60">
                <CardContent className="pt-6">
                  <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-brand" />
                  </div>
                  <h3 className="font-semibold mb-1.5 text-sm">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Get started in minutes</h2>
            <p className="text-muted-foreground text-lg">Three steps to a fully-managed rental portfolio.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-6 left-1/3 right-1/3 h-px bg-border" />
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="text-center relative">
                <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                  {n}
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Listings preview */}
      <section className="bg-muted/30 py-20 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 text-brand border-brand/30 bg-brand/5 text-xs">
            Listing Marketplace
          </Badge>
          <h2 className="text-3xl font-bold mb-4">Market your vacant units</h2>
          <p className="text-muted-foreground mb-8 text-lg max-w-xl mx-auto">
            Publish listings to the Keyrai marketplace and receive tenant inquiries, applications, and showing requests — all from your dashboard.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {["Publish listings in seconds", "Receive direct applications", "Convert leads to tenants"].map((item) => (
              <div key={item} className="flex items-center gap-2 justify-center text-sm">
                <CheckCircle2 className="h-4 w-4 text-brand flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <Link href="/listings">
            <Button variant="outline" size="lg" className="gap-2">
              Browse the Marketplace <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground text-lg">Start free. Upgrade when you&apos;re ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border-2 p-8 flex flex-col ${
                  plan.highlight
                    ? "border-brand bg-brand/5 shadow-lg shadow-brand/10"
                    : "border-border"
                }`}
              >
                {plan.highlight && (
                  <Badge className="mb-4 w-fit bg-brand text-white text-xs">Most Popular</Badge>
                )}
                <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-extrabold text-brand">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">/ {plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.desc}</p>
                <ul className="space-y-2 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-brand flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <Button
                    className="w-full"
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Renters */}
      <section className="bg-muted/30 py-20 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="outline" className="mb-4 text-brand border-brand/30 bg-brand/5 text-xs">For Renters</Badge>
            <h2 className="text-3xl font-bold mb-4">Find your next home</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Browse verified rental listings from trusted landlords. Filter by price, bedrooms, location, and availability.
              Apply directly and get a response in minutes.
            </p>
            <ul className="space-y-2 mb-8">
              {["Verified landlords", "Apply online in minutes", "Secure your unit with digital lease", "Pay rent with digital receipts"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-brand flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/listings">
              <Button className="gap-2">
                Browse Listings <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Listings available", value: "200+" },
              { label: "Cities covered", value: "15+" },
              { label: "Verified landlords", value: "500+" },
              { label: "Avg. response time", value: "< 24h" },
            ].map(({ label, value }) => (
              <Card key={label}>
                <CardContent className="pt-5 pb-5 text-center">
                  <p className="text-2xl font-bold text-brand">{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand py-20 px-4 sm:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to manage smarter?
        </h2>
        <p className="text-white/80 mb-8 max-w-lg mx-auto text-lg">
          Join 500+ landlords already using Keyrai to save time, reduce disputes, and get paid on time.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="gap-2 text-brand font-semibold h-12 px-8">
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/listings">
            <Button size="lg" variant="outline" className="gap-2 border-white/40 text-white hover:bg-white/10 h-12">
              Browse Properties
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand rounded-md flex items-center justify-center">
              <Home className="h-3 w-3 text-white" />
            </div>
            <span className="font-bold text-brand">Keyrai</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#features" className="hover:text-foreground">Features</Link>
            <Link href="#pricing" className="hover:text-foreground">Pricing</Link>
            <Link href="/listings" className="hover:text-foreground">Listings</Link>
            <Link href="/login" className="hover:text-foreground">Sign In</Link>
            <Link href="/signup" className="hover:text-foreground">Sign Up</Link>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Keyrai</p>
        </div>
      </footer>
    </div>
  );
}
