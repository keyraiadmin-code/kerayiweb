"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  initialQ?: string;
  initialBeds?: string;
  initialMaxRent?: string;
  initialSort?: string;
}

const BED_OPTIONS = [
  { label: "Any", value: "" },
  { label: "Studio", value: "0" },
  { label: "1 BR", value: "1" },
  { label: "2 BR", value: "2" },
  { label: "3 BR", value: "3" },
  { label: "4+ BR", value: "4" },
];

const PRICE_OPTIONS = [
  { label: "Any price", value: "" },
  { label: "Under ETB 5k", value: "5000" },
  { label: "Under ETB 10k", value: "10000" },
  { label: "Under ETB 20k", value: "20000" },
  { label: "Under ETB 50k", value: "50000" },
];

const SORT_OPTIONS = [
  { label: "Newest first", value: "" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

export function ListingsFilterBar({ initialQ = "", initialBeds = "", initialMaxRent = "", initialSort = "" }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);

  function push(overrides: Record<string, string> = {}) {
    const state = { q, beds: initialBeds, maxRent: initialMaxRent, sort: initialSort, ...overrides };
    const params = new URLSearchParams();
    if (state.q) params.set("q", state.q);
    if (state.beds) params.set("beds", state.beds);
    if (state.maxRent) params.set("maxRent", state.maxRent);
    if (state.sort) params.set("sort", state.sort);
    router.push(`/listings${params.size ? "?" + params : ""}`);
  }

  const hasFilters = !!(initialQ || initialBeds || initialMaxRent || initialSort);

  return (
    <div className="border-b bg-background sticky top-0 z-30 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 space-y-3">
        {/* Search bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); push(); }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by city, area, or keyword…"
              className="w-full pl-9 pr-4 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-brand"
            />
            {q && (
              <button type="button" onClick={() => { setQ(""); push({ q: "" }); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
          <Button type="submit" size="sm">Search</Button>
        </form>

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap items-center">
          {/* Bedrooms */}
          <div className="flex gap-1">
            {BED_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => push({ beds: o.value })}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                  initialBeds === o.value
                    ? "bg-brand text-white border-brand"
                    : "bg-background hover:bg-muted border-border"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Price */}
          <select
            value={initialMaxRent}
            onChange={(e) => push({ maxRent: e.target.value })}
            className="text-xs border rounded-md px-2 py-1 bg-background focus:outline-none focus:ring-2 focus:ring-brand"
          >
            {PRICE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={initialSort}
            onChange={(e) => push({ sort: e.target.value })}
            className="text-xs border rounded-md px-2 py-1 bg-background focus:outline-none focus:ring-2 focus:ring-brand"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {hasFilters && (
            <button onClick={() => router.push("/listings")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 ml-auto">
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
