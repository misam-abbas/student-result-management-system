import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ResultView } from "@/types";
import { INSTITUTE_NAME } from "@/constants/routes";
import { formatDateShort } from "@/utils/format";

type RGB = [number, number, number];
const INK: RGB = [26, 31, 46];
const GOLD: RGB = [163, 130, 63];
const BURGUNDY: RGB = [123, 45, 62];
const SAGE: RGB = [79, 133, 104];
const MUTED: RGB = [120, 120, 120];

interface AutoTableDoc extends jsPDF {
  lastAutoTable: { finalY: number };
}

/** Draws a simple vector "seal" medallion — no external logo image required. */
function drawSeal(doc: jsPDF, cx: number, cy: number, r: number) {
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.circle(cx, cy, r, "S");
  doc.setLineWidth(0.35);
  doc.circle(cx, cy, r - 2, "S");

  const tickCount = 16;
  for (let i = 0; i < tickCount; i++) {
    const angle = (i / tickCount) * Math.PI * 2;
    const x1 = cx + Math.cos(angle) * (r - 2);
    const y1 = cy + Math.sin(angle) * (r - 2);
    const x2 = cx + Math.cos(angle) * (r - 0.2);
    const y2 = cy + Math.sin(angle) * (r - 0.2);
    doc.line(x1, y1, x2, y2);
  }
  doc.setFillColor(...GOLD);
  doc.circle(cx, cy, 1.6, "F");
}

export function generateResultPDF(result: ResultView): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;

  // ---- Header ----
  drawSeal(doc, margin + 8, 22, 8);
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...INK);
  doc.text(INSTITUTE_NAME, margin + 20, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text("Official Student Result Transcript", margin + 20, 26);

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.line(margin, 34, pageWidth - margin, 34);

  // ---- Student info ----
  let y = 44;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text("Student Information", margin, y);
  y += 7;

  const infoRows: [string, string][] = [
    ["Student Name", result.student.name],
    ["Father Name", result.student.fatherName],
    ["Roll Number", result.student.rollNumber],
    ["CNIC", result.student.cnic],
    ["Department", result.student.department],
    ["Semester", result.student.semester],
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const colWidth = (pageWidth - margin * 2) / 2;
  infoRows.forEach((row, i) => {
    const col = i % 2;
    const rowY = y + Math.floor(i / 2) * 7;
    const xPos = margin + col * colWidth;
    doc.setTextColor(...MUTED);
    doc.text(`${row[0]}:`, xPos, rowY);
    doc.setTextColor(...INK);
    doc.text(row[1], xPos + 32, rowY);
  });

  y += Math.ceil(infoRows.length / 2) * 7 + 8;

  // ---- Subjects table ----
  autoTable(doc, {
    startY: y,
    head: [["#", "Subject", "Obtained Marks", "Total Marks"]],
    body: result.subjects.map((s, i) => [
      String(i + 1),
      s.subjectName,
      String(s.obtainedMarks),
      String(s.totalMarks),
    ]),
    foot: [["", "Total", String(result.obtainedMarks), String(result.totalMarks)]],
    theme: "grid",
    headStyles: { fillColor: INK, textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [237, 231, 212], textColor: INK, fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 3 },
    margin: { left: margin, right: margin },
  });

  const afterTableY = (doc as AutoTableDoc).lastAutoTable.finalY + 10;

  // ---- Summary band ----
  const statusColor = result.status === "PASS" ? SAGE : BURGUNDY;
  doc.setFillColor(...statusColor);
  doc.roundedRect(margin, afterTableY, pageWidth - margin * 2, 20, 2, 2, "F");
  doc.setTextColor(255, 255, 255);

  const summaryItems: [string, string][] = [
    ["Percentage", `${result.percentage.toFixed(2)}%`],
    ["GPA", result.gpa.toFixed(2)],
    ["Status", result.status],
  ];
  const summaryColWidth = (pageWidth - margin * 2) / 3;
  summaryItems.forEach((item, i) => {
    const xPos = margin + i * summaryColWidth + summaryColWidth / 2;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(item[0].toUpperCase(), xPos, afterTableY + 7, { align: "center" });
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(item[1], xPos, afterTableY + 15, { align: "center" });
  });

  // ---- Signatures + date ----
  const sigY = afterTableY + 40;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(margin, sigY, margin + 55, sigY);
  doc.line(pageWidth - margin - 55, sigY, pageWidth - margin, sigY);
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.text("Controller of Examinations", margin, sigY + 5);
  doc.text("Registrar", pageWidth - margin - 55, sigY + 5);

  doc.setFontSize(9);
  doc.text(`Date Generated: ${formatDateShort(new Date())}`, margin, sigY + 16);

  doc.setFontSize(8);
  doc.setTextColor(160, 160, 160);
  doc.text(
    "This is a computer-generated document and does not require a physical signature to be considered valid.",
    pageWidth / 2,
    286,
    { align: "center" }
  );

  doc.save(`Result_${result.student.rollNumber}.pdf`);
}
