"use client";

import { useState } from "react";
import type { Event } from "@/lib/types";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";

type DownloadCalendarPdfButtonProps = {
  events: Event[];
};

export default function DownloadCalendarPdfButton({ events }: DownloadCalendarPdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const { generateSchoolCalendarPdf } = await import("@/lib/pdf/schoolCalendarPdf");
      await generateSchoolCalendarPdf(events);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isGenerating}
      onClick={handleDownload}
      title="Download a formal PDF copy of the school calendar"
    >
      {isGenerating ? (
        <span className="inline-flex items-center gap-2">
          <LoadingSpinner />
          Generating PDF...
        </span>
      ) : (
        "Download as PDF"
      )}
    </Button>
  );
}
