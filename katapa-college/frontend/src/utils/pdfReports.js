// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: pdfReports.js                                        ║
// ║  PATH: frontend/src/utils/pdfReports.js                     ║
// ║                                                              ║
// ║  KYA HAI YE FILE?                                            ║
// ║  → Results aur Fees ka PDF generate karne ki utility.        ║
// ║  → jsPDF + jspdf-autotable use hota hai.                    ║
// ║  → Admin aur Student dono pages se call hota hai.           ║
// ╚══════════════════════════════════════════════════════════════╝
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ── Shared constants ──────────────────────────────────────────
const GOLD = [212, 175, 55];
const DARK = [26, 26, 46];
const WHITE = [255, 255, 255];
const GRAY = [107, 114, 128];
const LIGHT_BG = [248, 249, 252];
const GREEN = [22, 163, 74];
const RED = [220, 38, 38];

const COLLEGE_NAME = 'Kingswell Institute of Technology';
const fmt = (n) => `KSh ${Number(n || 0).toLocaleString()}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ── Header helper ─────────────────────────────────────────────
function drawHeader(doc, title, subtitle) {
  // Gold header bar
  doc.setFillColor(...GOLD);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');

  // College name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...WHITE);
  doc.text(COLLEGE_NAME, 14, 18);

  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255, 200);
  doc.text(title, 14, 28);

  // Date on right
  doc.setFontSize(8);
  doc.setTextColor(...WHITE);
  doc.text(`Generated: ${new Date().toLocaleString()}`, doc.internal.pageSize.getWidth() - 14, 28, { align: 'right' });

  // Subtitle below header
  if (subtitle) {
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'italic');
    doc.text(subtitle, 14, 50);
  }
}

// ── Footer helper ─────────────────────────────────────────────
function drawFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const h = doc.internal.pageSize.getHeight();
    const w = doc.internal.pageSize.getWidth();
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.5);
    doc.line(14, h - 18, w - 14, h - 18);
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${COLLEGE_NAME}  •  Official Document`, 14, h - 12);
    doc.text(`Page ${i} of ${pageCount}`, w - 14, h - 12, { align: 'right' });
  }
}

// ══════════════════════════════════════════════════════════════
//  1. SINGLE RESULT PDF — One student, one result
// ══════════════════════════════════════════════════════════════
export function downloadResultPDF(result) {
  const doc = new jsPDF();
  const r = result;
  const studentName = `${r.student?.firstName || ''} ${r.student?.lastName || ''}`.trim();
  const admNo = r.student?.admissionNumber || 'N/A';

  drawHeader(doc, 'Student Examination Result', `${studentName} — ${r.semester}`);

  let y = 56;

  // Student info boxes
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(14, y, 85, 28, 3, 3, 'F');
  doc.roundedRect(103, y, 93, 28, 3, 3, 'F');

  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  doc.text('Student Name', 18, y + 8);
  doc.text('Admission No.', 107, y + 8);

  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.text(studentName, 18, y + 20);
  doc.text(admNo, 107, y + 20);

  y += 34;

  // Semester, Exam Type, Overall
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(14, y, 55, 28, 3, 3, 'F');
  doc.roundedRect(73, y, 55, 28, 3, 3, 'F');
  doc.roundedRect(132, y, 64, 28, 3, 3, 'F');

  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  doc.text('Semester', 18, y + 8);
  doc.text('Exam Type', 77, y + 8);
  doc.text('Overall Result', 136, y + 8);

  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.text(r.semester || '—', 18, y + 20);

  doc.setFont('helvetica', 'normal');
  const examType = (r.examType || 'final').charAt(0).toUpperCase() + (r.examType || 'final').slice(1);
  doc.text(examType, 77, y + 20);

  // Overall grade large
  const gradeColor = r.overallPercentage >= 50 ? GREEN : RED;
  doc.setFontSize(14);
  doc.setTextColor(...gradeColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`${r.overallGrade}  (${r.overallPercentage}%)`, 136, y + 21);

  y += 36;

  // Subject table
  doc.autoTable({
    startY: y,
    head: [['#', 'Subject', 'Marks Obtained', 'Total Marks', 'Percentage', 'Grade']],
    body: r.subjects.map((s, i) => [
      i + 1,
      s.subject,
      s.marksObtained,
      s.totalMarks,
      `${s.percentage}%`,
      s.grade,
    ]),
    headStyles: {
      fillColor: GOLD,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: DARK,
    },
    alternateRowStyles: {
      fillColor: LIGHT_BG,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
    theme: 'grid',
    styles: {
      lineColor: [229, 231, 235],
      lineWidth: 0.3,
    },
  });

  y = doc.lastAutoTable.finalY + 8;

  // Remarks
  if (r.remarks) {
    doc.setFillColor(...LIGHT_BG);
    doc.roundedRect(14, y, doc.internal.pageSize.getWidth() - 28, 16, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'normal');
    doc.text('Remarks:', 18, y + 6);
    doc.setTextColor(...DARK);
    doc.text(r.remarks, 42, y + 6);
    y += 20;
  }

  // Published date
  if (r.publishedAt) {
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(`Published on: ${fmtDate(r.publishedAt)}`, 14, y + 4);
  }

  drawFooter(doc);
  doc.save(`Result_${studentName.replace(/\s+/g, '_')}_${(r.semester || '').replace(/\s+/g, '_')}.pdf`);
}

// ══════════════════════════════════════════════════════════════
//  2. ALL RESULTS PDF — Admin summary of all results
// ══════════════════════════════════════════════════════════════
export function downloadAllResultsPDF(results) {
  const doc = new jsPDF('landscape');
  const published = results.filter(r => r.publishedAt).length;
  const failed = results.filter(r => r.overallGrade === 'F').length;

  drawHeader(doc, 'All Student Results — Summary Report', `Total: ${results.length} | Published: ${published} | Failed: ${failed}`);

  doc.autoTable({
    startY: 56,
    head: [['#', 'Student Name', 'Adm No.', 'Semester', 'Exam Type', 'Subjects', 'Overall %', 'Grade', 'Status']],
    body: results.map((r, i) => [
      i + 1,
      `${r.student?.firstName || ''} ${r.student?.lastName || ''}`.trim(),
      r.student?.admissionNumber || 'N/A',
      r.semester,
      (r.examType || 'final').charAt(0).toUpperCase() + (r.examType || 'final').slice(1),
      r.subjects?.length || 0,
      `${r.overallPercentage}%`,
      r.overallGrade,
      r.publishedAt ? 'Published' : 'Draft',
    ]),
    headStyles: {
      fillColor: GOLD,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: DARK,
    },
    alternateRowStyles: {
      fillColor: LIGHT_BG,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      5: { halign: 'center' },
      6: { halign: 'center' },
      7: { halign: 'center', fontStyle: 'bold' },
      8: { halign: 'center' },
    },
    margin: { left: 14, right: 14 },
    theme: 'grid',
    styles: {
      lineColor: [229, 231, 235],
      lineWidth: 0.3,
    },
  });

  drawFooter(doc);
  doc.save(`All_Results_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ══════════════════════════════════════════════════════════════
//  3. SINGLE FEE RECEIPT PDF — One fee record
// ══════════════════════════════════════════════════════════════
export function downloadFeeReceiptPDF(fee) {
  const doc = new jsPDF();
  const studentName = `${fee.student?.firstName || ''} ${fee.student?.lastName || ''}`.trim();
  const admNo = fee.student?.admissionNumber || 'N/A';

  drawHeader(doc, 'Official Fee Receipt', `${studentName} — ${fee.semester}`);

  let y = 56;

  // Info grid — row 1
  const boxW = 85;
  const boxH = 24;
  const gap = 4;
  const boxes = [
    { label: 'Student Name', value: studentName },
    { label: 'Admission No.', value: admNo },
    { label: 'Semester', value: fee.semester },
    { label: 'Fee Type', value: (fee.feeType || 'tuition').charAt(0).toUpperCase() + (fee.feeType || 'tuition').slice(1) },
    { label: 'Total Amount', value: fmt(fee.totalAmount), color: DARK },
    { label: 'Total Paid', value: fmt(fee.amountPaid || 0), color: GREEN },
    { label: 'Balance Due', value: fmt(fee.balance || 0), color: fee.balance > 0 ? RED : GREEN },
    { label: 'Status', value: (fee.status || 'unpaid').toUpperCase() },
    { label: 'Due Date', value: fmtDate(fee.dueDate) },
  ];

  if (fee.waiverAmount > 0) {
    boxes.push({ label: 'Waiver', value: `${fmt(fee.waiverAmount)} — ${fee.waiverReason || 'N/A'}` });
  }

  const cols = 2;
  const colW = (doc.internal.pageSize.getWidth() - 28 - gap) / cols;

  boxes.forEach((box, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const bx = 14 + col * (colW + gap);
    const by = y + row * (boxH + gap);

    doc.setFillColor(...LIGHT_BG);
    doc.roundedRect(bx, by, colW, boxH, 2, 2, 'F');

    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'normal');
    doc.text(box.label, bx + 6, by + 8);

    doc.setFontSize(11);
    doc.setTextColor(...(box.color || DARK));
    doc.setFont('helvetica', 'bold');
    doc.text(String(box.value), bx + 6, by + 18);
  });

  const totalRows = Math.ceil(boxes.length / cols);
  y += totalRows * (boxH + gap) + 6;

  // Transactions table
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Transactions', 14, y);
  y += 4;

  const txData = fee.transactions?.length
    ? fee.transactions.map((t, i) => [
        i + 1,
        fmt(t.amount),
        (t.method || '').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        t.reference || '—',
        t.note || '—',
        fmtDate(t.paidAt),
      ])
    : [['—', 'No payments recorded', '', '', '', '']];

  doc.autoTable({
    startY: y,
    head: [['#', 'Amount', 'Method', 'Reference', 'Note', 'Date']],
    body: txData,
    headStyles: {
      fillColor: GOLD,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: DARK,
    },
    alternateRowStyles: {
      fillColor: LIGHT_BG,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
    theme: 'grid',
    styles: {
      lineColor: [229, 231, 235],
      lineWidth: 0.3,
    },
  });

  drawFooter(doc);
  doc.save(`Fee_Receipt_${studentName.replace(/\s+/g, '_')}_${(fee.semester || '').replace(/\s+/g, '_')}.pdf`);
}

// ══════════════════════════════════════════════════════════════
//  4. ALL FEES PDF — Admin summary of all fee records
// ══════════════════════════════════════════════════════════════
export function downloadAllFeesPDF(fees, summary) {
  const doc = new jsPDF('landscape');

  drawHeader(doc, 'Fee Collection Report — Summary', summary
    ? `Billed: ${fmt(summary.totalBilled)} | Collected: ${fmt(summary.totalPaid)} | Outstanding: ${fmt(summary.totalBalance)}`
    : '');

  doc.autoTable({
    startY: 56,
    head: [['#', 'Student Name', 'Adm No.', 'Semester', 'Fee Type', 'Total', 'Paid', 'Balance', 'Due Date', 'Status']],
    body: fees.map((f, i) => [
      i + 1,
      `${f.student?.firstName || ''} ${f.student?.lastName || ''}`.trim(),
      f.student?.admissionNumber || 'N/A',
      f.semester,
      (f.feeType || 'tuition').charAt(0).toUpperCase() + (f.feeType || 'tuition').slice(1),
      fmt(f.totalAmount),
      fmt(f.amountPaid || 0),
      fmt(f.balance || 0),
      fmtDate(f.dueDate),
      (f.status || 'unpaid').toUpperCase(),
    ]),
    headStyles: {
      fillColor: GOLD,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: DARK,
    },
    alternateRowStyles: {
      fillColor: LIGHT_BG,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' },
      9: { halign: 'center', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
    theme: 'grid',
    styles: {
      lineColor: [229, 231, 235],
      lineWidth: 0.3,
    },
  });

  drawFooter(doc);
  doc.save(`Fee_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ══════════════════════════════════════════════════════════════
//  5. STUDENT ALL RESULTS PDF — Student's personal report card
// ══════════════════════════════════════════════════════════════
export function downloadMyResultsPDF(results) {
  if (!results.length) return;

  const doc = new jsPDF();
  const studentName = `${results[0].student?.firstName || ''} ${results[0].student?.lastName || ''}`.trim();
  const admNo = results[0].student?.admissionNumber || 'N/A';
  const avgPct = Math.round(results.reduce((s, r) => s + r.overallPercentage, 0) / results.length);
  const bestGrade = results.sort((a, b) => b.overallPercentage - a.overallPercentage)[0]?.overallGrade || '—';

  drawHeader(doc, 'Academic Report Card', `${studentName} (${admNo})`);

  let y = 56;

  // Summary boxes
  const summaryItems = [
    { label: 'Total Exams', value: String(results.length) },
    { label: 'Average Score', value: `${avgPct}%` },
    { label: 'Best Grade', value: bestGrade },
  ];

  const sBoxW = (doc.internal.pageSize.getWidth() - 28 - 8) / 3;
  summaryItems.forEach((item, i) => {
    const bx = 14 + i * (sBoxW + 4);
    doc.setFillColor(...LIGHT_BG);
    doc.roundedRect(bx, y, sBoxW, 22, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, bx + 6, y + 8);
    doc.setFontSize(14);
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'bold');
    doc.text(item.value, bx + 6, y + 18);
  });

  y += 30;

  // Each result as a section
  results.forEach((r, idx) => {
    // Check page break
    if (y > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage();
      y = 20;
    }

    // Section heading
    doc.setFontSize(10);
    doc.setTextColor(...GOLD);
    doc.setFont('helvetica', 'bold');
    const examLabel = (r.examType || 'final').charAt(0).toUpperCase() + (r.examType || 'final').slice(1);
    doc.text(`${r.semester}  •  ${examLabel}  •  Grade: ${r.overallGrade} (${r.overallPercentage}%)`, 14, y);
    y += 2;

    doc.autoTable({
      startY: y,
      head: [['Subject', 'Marks', 'Total', '%', 'Grade']],
      body: r.subjects.map(s => [
        s.subject,
        s.marksObtained,
        s.totalMarks,
        `${s.percentage}%`,
        s.grade,
      ]),
      headStyles: {
        fillColor: GOLD,
        textColor: WHITE,
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: DARK,
      },
      alternateRowStyles: {
        fillColor: LIGHT_BG,
      },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center', fontStyle: 'bold' },
      },
      margin: { left: 14, right: 14 },
      theme: 'grid',
      styles: {
        lineColor: [229, 231, 235],
        lineWidth: 0.3,
      },
    });

    y = doc.lastAutoTable.finalY + 10;
  });

  drawFooter(doc);
  doc.save(`Report_Card_${studentName.replace(/\s+/g, '_')}.pdf`);
}

// ══════════════════════════════════════════════════════════════
//  6. STUDENT ALL FEES PDF — Student's personal fee statement
// ══════════════════════════════════════════════════════════════
export function downloadMyFeesPDF(fees) {
  if (!fees.length) return;

  const doc = new jsPDF();
  const studentName = `${fees[0].student?.firstName || ''} ${fees[0].student?.lastName || ''}`.trim();
  const admNo = fees[0].student?.admissionNumber || 'N/A';
  const totalBilled = fees.reduce((s, f) => s + f.totalAmount, 0);
  const totalPaid = fees.reduce((s, f) => s + (f.amountPaid || 0), 0);
  const totalBalance = fees.reduce((s, f) => s + (f.balance || 0), 0);

  drawHeader(doc, 'Fee Statement', `${studentName} (${admNo})`);

  let y = 56;

  // Summary boxes
  const summaryItems = [
    { label: 'Total Billed', value: fmt(totalBilled), color: DARK },
    { label: 'Total Paid', value: fmt(totalPaid), color: GREEN },
    { label: 'Balance Due', value: fmt(totalBalance), color: totalBalance > 0 ? RED : GREEN },
  ];

  const sBoxW = (doc.internal.pageSize.getWidth() - 28 - 8) / 3;
  summaryItems.forEach((item, i) => {
    const bx = 14 + i * (sBoxW + 4);
    doc.setFillColor(...LIGHT_BG);
    doc.roundedRect(bx, y, sBoxW, 22, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, bx + 6, y + 8);
    doc.setFontSize(12);
    doc.setTextColor(...(item.color));
    doc.setFont('helvetica', 'bold');
    doc.text(item.value, bx + 6, y + 18);
  });

  y += 30;

  // Fee table
  doc.autoTable({
    startY: y,
    head: [['#', 'Semester', 'Fee Type', 'Total', 'Paid', 'Balance', 'Due Date', 'Status']],
    body: fees.map((f, i) => [
      i + 1,
      f.semester,
      (f.feeType || 'tuition').charAt(0).toUpperCase() + (f.feeType || 'tuition').slice(1),
      fmt(f.totalAmount),
      fmt(f.amountPaid || 0),
      fmt(f.balance || 0),
      fmtDate(f.dueDate),
      (f.status || 'unpaid').toUpperCase(),
    ]),
    headStyles: {
      fillColor: GOLD,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: DARK,
    },
    alternateRowStyles: {
      fillColor: LIGHT_BG,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      7: { halign: 'center', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
    theme: 'grid',
    styles: {
      lineColor: [229, 231, 235],
      lineWidth: 0.3,
    },
  });

  drawFooter(doc);
  doc.save(`Fee_Statement_${studentName.replace(/\s+/g, '_')}.pdf`);
}
