"use client";

import { useState } from "react";
import { Share2, Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  url: string;
  title: string;
  className?: string;
}

export function ShareButton({ url, title, className }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof navigator === "undefined") return;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" onClick={handleShare} className={className}>
      {copied ? (
        <><Check className="h-4 w-4 mr-2 text-brand" />Copied!</>
      ) : (
        <><Share2 className="h-4 w-4 mr-2" />Share</>
      )}
    </Button>
  );
}
