"use client";

import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";

export function LangSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(locale === "en" ? "am" : "en")}
      className="font-medium text-xs px-2"
    >
      {locale === "en" ? "አማ" : "EN"}
    </Button>
  );
}
