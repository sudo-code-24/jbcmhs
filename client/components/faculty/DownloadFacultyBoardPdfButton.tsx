"use client";

import { useState } from "react";
import type { FacultyBoardPdfGroup } from "@/lib/pdf/facultyBoardPdf";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

type DownloadFacultyBoardPdfButtonProps = {
  groups: FacultyBoardPdfGroup[];
  disabled?: boolean;
  className?: string;
};

export default function DownloadFacultyBoardPdfButton({ groups, disabled, className }: DownloadFacultyBoardPdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const { generateFacultyBoardPdf } = await import("@/lib/pdf/facultyBoardPdf");
      await generateFacultyBoardPdf(groups);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled || isGenerating || groups.length === 0}
      onClick={handleDownload}
      title="Download a formal PDF of the faculty board (same header style as the school calendar PDF)"
      className={cn(className)}
    >
      {isGenerating ? (
        <span className="inline-flex items-center gap-2">
          <LoadingSpinner />
          Generating PDF...
        </span>
      ) : (
        "Export to PDF"
      )}
    </Button>
  );
}
