import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Event } from "@/lib/types";

const PDF_TITLE = "JOSE B. CARDENAS MEMORIAL HIGH SCHOOL CALENDAR 2026";
const ACCENT_RGB: [number, number, number] = [44, 62, 80]; // #2c3e50
const MONTH_HEADER_FILL: [number, number, number] = [240, 240, 240];
const SCHOOL_LOGO_URL = "/jbcmhs_logo.png";

function normalizeDate(input?: string | Date): Date | null {
  if (!input) return null;
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function formatDate(input?: string | Date): string {
  const parsed = normalizeDate(input);
  if (!parsed) return "-";
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatDateRange(start: string | Date, end?: string | Date): string {
  const startLabel = formatDate(start);
  if (!end) return startLabel;
  const endLabel = formatDate(end);
  if (startLabel === endLabel) return startLabel;
  return `${startLabel} - ${endLabel}`;
}

function toCategoryLabel(type: Event["type"]): string {
  switch (type) {
    case "academic":
      return "Academic";
    case "sports":
      return "Sports";
    case "event":
    default:
      return "Event";
  }
}

type MonthGroup = {
  label: string;
  events: Event[];
};

function groupEventsByMonth(events: Event[]): MonthGroup[] {
  const sorted = [...events].sort((a, b) => {
    const timeA = normalizeDate(a.date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const timeB = normalizeDate(b.date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return timeA - timeB;
  });

  const map = new Map<string, Event[]>();

  for (const event of sorted) {
    const d = normalizeDate(event.date);
    const key = d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` : "Unknown";
    const bucket = map.get(key) ?? [];
    bucket.push(event);
    map.set(key, bucket);
  }

  return Array.from(map.entries()).map(([key, groupedEvents]) => {
    if (key === "Unknown") {
      return { label: "UNKNOWN DATE", events: groupedEvents };
    }
    const [year, month] = key.split("-");
    const labelDate = new Date(Number(year), Number(month) - 1, 1);
    const label = labelDate
      .toLocaleDateString("en-US", { month: "long", year: "numeric" })
      .toUpperCase();
    return { label, events: groupedEvents };
  });
}

function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Unable to read logo file"));
    reader.readAsDataURL(file);
  });
}

async function loadSchoolLogoDataUrl(): Promise<string | null> {
  try {
    const response = await fetch(SCHOOL_LOGO_URL);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await fileToDataUrl(blob);
  } catch {
    return null;
  }
}

export async function generateSchoolCalendarPdf(events: Event[]): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;
  const logoX = marginX;
  const logoY = 10;
  const logoSize = 18;
  const headerTextLeft = logoX + logoSize + 6;
  const headerTextRight = pageWidth - marginX;
  const headerTextWidth = headerTextRight - headerTextLeft;
  const headerTextCenterX = headerTextLeft + headerTextWidth / 2;
  const tableStartY = 44;
  const logoDataUrl = await loadSchoolLogoDataUrl();
  const generatedAt = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", logoX, logoY, logoSize, logoSize, undefined, "FAST");
  } else {
    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(180, 180, 180);
    doc.rect(logoX, logoY, logoSize, logoSize, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(90, 90, 90);
    doc.text("LOGO", logoX + logoSize / 2, logoY + logoSize / 2, { align: "center", baseline: "middle" });
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...ACCENT_RGB);
  const titleLines = doc.splitTextToSize(PDF_TITLE, headerTextWidth) as string[];
  doc.text(titleLines, headerTextCenterX, 16, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const titleBottomY = 16 + (titleLines.length - 1) * 6;
  doc.text(`Last Updated: ${generatedAt}`, headerTextCenterX, titleBottomY + 8, { align: "center" });

  const rows: Array<Array<string | { content: string; colSpan: number; styles: Record<string, unknown> }>> = [];
  const groups = groupEventsByMonth(events);

  for (const group of groups) {
    rows.push([
      {
        content: group.label,
        colSpan: 4,
        styles: {
          fillColor: MONTH_HEADER_FILL,
          textColor: [0, 0, 0],
          fontStyle: "bold",
          halign: "left",
        },
      },
    ]);

    for (const event of group.events) {
      rows.push([
        formatDateRange(event.date, event.endDate),
        toCategoryLabel(event.type),
        event.title || "-",
        event.description || "-",
      ]);
    }
  }

  if (rows.length === 0) {
    rows.push([
      {
        content: "NO EVENTS AVAILABLE",
        colSpan: 4,
        styles: {
          fillColor: MONTH_HEADER_FILL,
          textColor: [80, 80, 80],
          fontStyle: "bold",
          halign: "center",
        },
      },
    ]);
  }

  autoTable(doc, {
    startY: tableStartY,
    theme: "grid",
    head: [["Date", "Category", "Event Title", "Description"]],
    body: rows,
    styles: {
      font: "helvetica",
      fontSize: 9,
      textColor: [0, 0, 0],
      lineColor: [180, 180, 180],
      lineWidth: 0.1,
      overflow: "linebreak",
      cellPadding: 2.3,
      valign: "top",
    },
    headStyles: {
      fillColor: ACCENT_RGB,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 24 },
      2: { cellWidth: 48, fontStyle: "bold" },
      3: { cellWidth: 82 },
    },
    didParseCell: (hookData) => {
      if (hookData.section !== "body") return;
      if (hookData.column.index === 0 && hookData.cell.colSpan === 4) {
        hookData.cell.styles.fillColor = MONTH_HEADER_FILL;
        hookData.cell.styles.fontStyle = "bold";
      }
    },
    margin: { left: marginX, right: marginX, bottom: 18 },
  });

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(95, 95, 95);
    doc.text(
      "Dates are subject to change. Please visit the school portal for real-time updates.",
      marginX,
      289
    );
    doc.text(`Page ${page} of ${totalPages}`, pageWidth - marginX, 289, { align: "right" });
  }

  doc.save("official-school-calendar-2026.pdf");
}
