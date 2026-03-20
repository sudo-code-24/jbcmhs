import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { FacultyCardItem } from "@/hooks/useFacultyBoard";
import { ACCENT_RGB, drawSchoolFormalPdfHeader } from "./schoolPdfHeader";

const PDF_TITLE = "JOSE B. CARDENAS MEMORIAL HIGH SCHOOL — FACULTY BOARD";
const SECTION_HEADER_FILL: [number, number, number] = [240, 240, 240];

export type FacultyBoardPdfGroup = {
  section: string;
  cards: FacultyCardItem[];
};

export async function generateFacultyBoardPdf(groups: FacultyBoardPdfGroup[]): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const { pageWidth, marginX, tableStartY } = await drawSchoolFormalPdfHeader(doc, PDF_TITLE);

  const NUM_COLS = 5;
  const rows: Array<Array<string | { content: string; colSpan: number; styles: Record<string, unknown> }>> = [];

  for (const group of groups) {
    const sorted = [...group.cards].sort((a, b) => a.positionIndex - b.positionIndex);
    rows.push([
      {
        content: group.section.toUpperCase(),
        colSpan: NUM_COLS,
        styles: {
          fillColor: SECTION_HEADER_FILL,
          textColor: [0, 0, 0],
          fontStyle: "bold",
          halign: "left",
        },
      },
    ]);
    for (const card of sorted) {
      rows.push([
        card.name || "—",
        card.role || "—",
        card.department || "—",
        card.email?.trim() || "—",
        card.phone?.trim() || "—",
      ]);
    }
  }

  if (rows.length === 0) {
    rows.push([
      {
        content: "NO FACULTY LISTED",
        colSpan: NUM_COLS,
        styles: {
          fillColor: SECTION_HEADER_FILL,
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
    head: [["Name", "Role", "Department", "Email", "Phone"]],
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
      0: { cellWidth: 38 },
      1: { cellWidth: 32 },
      2: { cellWidth: 34 },
      3: { cellWidth: 44 },
      4: { cellWidth: 30 },
    },
    didParseCell: (hookData) => {
      if (hookData.section !== "body") return;
      if (hookData.column.index === 0 && hookData.cell.colSpan === NUM_COLS) {
        hookData.cell.styles.fillColor = SECTION_HEADER_FILL;
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
    doc.text("Contact the school for the most current faculty information.", marginX, 289);
    doc.text(`Page ${page} of ${totalPages}`, pageWidth - marginX, 289, { align: "right" });
  }

  doc.save("faculty-board.pdf");
}
