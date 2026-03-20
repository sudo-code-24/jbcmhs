import { jsPDF } from "jspdf";

/** Matches calendar / formal school PDF branding (#2c3e50) */
export const ACCENT_RGB: [number, number, number] = [44, 62, 80];

const SCHOOL_LOGO_URL = "/jbcmhs_logo.png";

function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Unable to read logo file"));
    reader.readAsDataURL(file);
  });
}

export async function loadSchoolLogoDataUrl(): Promise<string | null> {
  try {
    const response = await fetch(SCHOOL_LOGO_URL);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await fileToDataUrl(blob);
  } catch {
    return null;
  }
}

export type SchoolFormalPdfHeaderLayout = {
  pageWidth: number;
  marginX: number;
  tableStartY: number;
  headerTextCenterX: number;
};

/**
 * Logo + centered title + "Last Updated" — same layout as the official calendar PDF.
 */
export async function drawSchoolFormalPdfHeader(doc: jsPDF, title: string): Promise<SchoolFormalPdfHeaderLayout> {
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
  const titleLines = doc.splitTextToSize(title, headerTextWidth) as string[];
  doc.text(titleLines, headerTextCenterX, 16, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const titleBottomY = 16 + (titleLines.length - 1) * 6;
  doc.text(`Last Updated: ${generatedAt}`, headerTextCenterX, titleBottomY + 8, { align: "center" });

  return { pageWidth, marginX, tableStartY, headerTextCenterX };
}
