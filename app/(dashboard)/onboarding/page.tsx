"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2, Users, CreditCard, Wrench, ChevronRight,
  CheckCircle2, Home, ListFilter, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const UNIT_RANGES = [
  { value: "1-5", label: "1 – 5 units", desc: "Getting started" },
  { value: "6-20", label: "6 – 20 units", desc: "Small portfolio" },
  { value: "21-100", label: "21 – 100 units", desc: "Growing business" },
  { value: "100+", label: "100+ units", desc: "Large portfolio" },
];

const GOALS = [
  { value: "manage", icon: Building2, label: "Manage existing properties", desc: "Track rent, maintenance, and tenants" },
  { value: "tenants", icon: Users, label: "Find new tenants", desc: "Publish listings and receive applications" },
  { value: "both", icon: Home, label: "Both", desc: "Full property management + marketing" },
];

const SETUP_STEPS = [
  { href: "/properties/new", icon: Building2, label: "Add your first property", desc: "Set up your building or home to manage" },
  { href: "/tenants/new", icon: Users, label: "Add a tenant", desc: "Add an existing or new tenant" },
  { href: "/leases/new", icon: CheckCircle2, label: "Create a lease", desc: "Link a tenant to a unit with a lease agreement" },
  { href: "/payments/new", icon: CreditCard, label: "Record a payment", desc: "Log a rent payment and generate a receipt" },
  { href: "/listings/manage/new", icon: ListFilter, label: "Create a listing", desc: "Market a vacant unit on the marketplace" },
  { href: "/maintenance/new", icon: Wrench, label: "Log a maintenance request", desc: "Track repairs and assign to vendors" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<"units" | "goals" | "setup">("units");
  const [units, setUnits] = useState("");
  const [goal, setGoal] = useState("");

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-xl space-y-6">
        {/* Progress */}
        <div className="flex items-center gap-2 justify-center">
          {["units", "goals", "setup"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                step === s ? "bg-brand text-white" :
                  ["units", "goals", "setup"].indexOf(step) > i ? "bg-brand/20 text-brand" : "bg-muted text-muted-foreground"
              )}>
                {i + 1}
              </div>
              {i < 2 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Step: unit count */}
        {step === "units" && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-7 w-7 text-brand" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Welcome to Keyrai!</h1>
              <p className="text-muted-foreground">Let&apos;s set up your account. How many units do you manage?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {UNIT_RANGES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setUnits(r.value)}
                  className={cn(
                    "border rounded-xl p-4 text-left transition-all",
                    units === r.value ? "border-brand bg-brand/5 shadow-sm" : "hover:border-brand/50 hover:bg-muted/50"
                  )}
                >
                  <p className="font-semibold text-sm">{r.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
            <Button className="w-full gap-2 h-11" disabled={!units} onClick={() => setStep("goals")}>
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step: goal */}
        {step === "goals" && (
          <div className="space-y-5">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">What&apos;s your main goal?</h1>
              <p className="text-muted-foreground">We&apos;ll personalise your setup based on your needs.</p>
            </div>
            <div className="space-y-3">
              {GOALS.map(({ value, icon: Icon, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setGoal(value)}
                  className={cn(
                    "w-full border rounded-xl p-4 text-left flex items-center gap-4 transition-all",
                    goal === value ? "border-brand bg-brand/5" : "hover:border-brand/40 hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    goal === value ? "bg-brand/15" : "bg-muted"
                  )}>
                    <Icon className={cn("h-5 w-5", goal === value ? "text-brand" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  {goal === value && <CheckCircle2 className="h-4 w-4 text-brand ml-auto flex-shrink-0" />}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep("units")}>Back</Button>
              <Button className="flex-1 gap-2 h-11" disabled={!goal} onClick={() => setStep("setup")}>
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: setup checklist */}
        {step === "setup" && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-7 w-7 text-brand" />
              </div>
              <h1 className="text-2xl font-bold mb-2">You&apos;re all set!</h1>
              <p className="text-muted-foreground">Here&apos;s your setup checklist. Complete these to get the most out of Keyrai.</p>
            </div>
            <div className="space-y-2">
              {SETUP_STEPS.filter((s) => {
                if (goal === "manage") return !["listings/manage/new"].some((p) => s.href.includes(p));
                if (goal === "tenants") return !["payments/new", "maintenance/new"].some((p) => s.href.includes(p));
                return true;
              }).map(({ href, icon: Icon, label, desc }) => (
                <Link key={href} href={href}>
                  <div className="flex items-center gap-4 p-3 rounded-xl border hover:border-brand/40 hover:bg-brand/5 transition-all cursor-pointer group">
                    <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-brand/10">
                      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-brand" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-brand flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">Skip to Dashboard</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
