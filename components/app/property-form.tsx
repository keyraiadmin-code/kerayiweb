"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createProperty } from "@/app/actions/properties";

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment / Multi-Unit Building", multiUnit: true },
  { value: "commercial", label: "Commercial Building", multiUnit: true },
  { value: "house", label: "Family Home / Single-Family", multiUnit: false },
  { value: "condo", label: "Condo", multiUnit: false },
  { value: "townhouse", label: "Townhouse", multiUnit: false },
  { value: "other", label: "Other", multiUnit: true },
];

interface PropertyFormProps {
  error?: string;
}

export function PropertyForm({ error }: PropertyFormProps) {
  const [selectedType, setSelectedType] = useState("apartment");
  const currentType = PROPERTY_TYPES.find((t) => t.value === selectedType);
  const isMultiUnit = currentType?.multiUnit ?? true;

  return (
    <>
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createProperty} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="name">
                Property Name <span className="text-destructive">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. Sunrise Apartments"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="ui_type">
                Property Type <span className="text-destructive">*</span>
              </label>
              <select
                id="ui_type"
                name="ui_type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {!isMultiUnit && (
                <p className="text-xs text-muted-foreground mt-1">
                  Single-unit property — one unit will be created automatically.
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="address">
                Address <span className="text-destructive">*</span>
              </label>
              <input
                id="address"
                name="address"
                type="text"
                required
                placeholder="e.g. 123 Main Street"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="e.g. Addis Ababa"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {isMultiUnit ? (
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="total_units">
                    Number of Units <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="total_units"
                    name="total_units"
                    type="number"
                    min="1"
                    defaultValue="1"
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              ) : (
                <input type="hidden" name="total_units" value="1" />
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="description">
                Description{" "}
                <span className="text-muted-foreground text-xs">(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Brief description of the property..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="submit" className="flex-1">
                Create Property
              </Button>
              <Link href="/properties">
                <Button type="button" variant="outline" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
