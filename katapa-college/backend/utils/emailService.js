// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: emailService.js                                      ║
// ║  PATH: backend/utils/emailService.js                         ║
// ║                                                              ║
// ║  KYA KARTA HAI?                                              ║
// ║  → Email templates aur send helper functions hain.           ║
// ║  → Beautiful HTML email templates banata hai (welcome,       ║
// ║    admission update, results, fee reminders, notices, etc.)  ║
// ║  → config/email.js ka transporter use karta hai.            ║
// ║                                                              ║
// ║  EXPORTS: sendWelcomeEmail, sendAdmissionUpdateEmail,       ║
// ║    sendResultEmail, sendFeeReminderEmail,                    ║
// ║    sendNoticeEmail, sendBroadcastEmail, sendTestEmail        ║
// ╚══════════════════════════════════════════════════════════════╝
const transporter = require('../config/email');

const FROM = process.env.EMAIL_FROM || 'Kingswell College <no-reply@kingswellcollege.ac.ke>';
const COLLEGE = 'Kingswell College';
const LOGO_TEXT = 'K'; // Shown in header circle

// ── Base HTML layout ────────────────────────────────────────────
function baseTemplate(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${COLLEGE}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#141420;border-radius:20px;overflow:hidden;border:1px solid rgba(212,175,55,0.2);">
      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#d4af37 0%,#f0d060 50%,#a0821a 100%);padding:24px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div style="display:inline-block;width:44px;height:44px;border-radius:50%;background:#0a0a0f;text-align:center;line-height:44px;font-size:20px;font-weight:bold;color:#d4af37;vertical-align:middle;">${LOGO_TEXT}</div>
                <span style="color:#0a0a0f;font-weight:bold;font-size:18px;vertical-align:middle;margin-left:12px;">${COLLEGE}</span>
              </td>
              <td align="right">
                <span style="color:rgba(10,10,15,0.6);font-size:11px;letter-spacing:2px;text-transform:uppercase;">Official Communication</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- Body -->
      <tr>
        <td style="padding:32px;">
          ${content}
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="border-top:1px solid rgba(212,175,55,0.1);padding:20px 32px;background:#0f0f1a;">
          <p style="margin:0;color:rgba(255,255,255,0.3);font-size:11px;text-align:center;font-family:Georgia,serif;">
            This is an official email from ${COLLEGE}. Please do not reply to this email.<br/>
            &copy; ${new Date().getFullYear()} ${COLLEGE} · Nairobi, Kenya
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ── Template helpers ─────────────────────────────────────────────
function heading(text) {
  return `<h1 style="margin:0 0 8px;color:#d4af37;font-size:22px;font-family:Georgia,serif;">${text}</h1>`;
}
function subheading(text) {
  return `<p style="margin:0 0 24px;color:rgba(255,255,255,0.5);font-size:13px;letter-spacing:1px;text-transform:uppercase;">${text}</p>`;
}
function paragraph(text) {
  return `<p style="margin:0 0 16px;color:rgba(255,255,255,0.8);font-size:14px;line-height:1.7;font-family:Georgia,serif;">${text}</p>`;
}
function infoRow(label, value) {
  return `<tr>
    <td style="padding:8px 12px;color:rgba(255,255,255,0.4);font-size:12px;white-space:nowrap;font-family:Georgia,serif;">${label}</td>
    <td style="padding:8px 12px;color:#fff;font-size:13px;font-weight:bold;font-family:Georgia,serif;">${value}</td>
  </tr>`;
}
function infoTable(rows) {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;border-radius:12px;margin:20px 0;border:1px solid rgba(212,175,55,0.1);">
    ${rows}
  </table>`;
}
function badge(text, color) {
  const colors = {
    green:  { bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.3)', text: '#34d399' },
    red:    { bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', text: '#f87171' },
    gold:   { bg: 'rgba(212,175,55,0.1)',  border: 'rgba(212,175,55,0.3)',  text: '#d4af37' },
    blue:   { bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.3)',  text: '#60a5fa' },
    orange: { bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.3)',  text: '#fb923c' },
  };
  const c = colors[color] || colors.gold;
  return `<span style="display:inline-block;padding:4px 14px;border-radius:999px;background:${c.bg};border:1px solid ${c.border};color:${c.text};font-size:12px;font-weight:bold;letter-spacing:1px;">${text}</span>`;
}
function button(text, url) {
  return `<div style="margin:24px 0;text-align:center;">
    <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#d4af37,#f0d060);color:#0a0a0f;text-decoration:none;padding:12px 32px;border-radius:999px;font-weight:bold;font-size:14px;font-family:Georgia,serif;">${text}</a>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════

// 1. Application Received (auto after form submit)
function applicationReceivedHtml({ firstName, lastName, courseTitle, applicationId }) {
  return baseTemplate(`
    ${heading('Application Received!')}
    ${subheading('Admission Application Confirmation')}
    ${paragraph(`Dear <strong style="color:#fff;">${firstName} ${lastName}</strong>,`)}
    ${paragraph(`Thank you for applying to <strong style="color:#d4af37;">${COLLEGE}</strong>. We have successfully received your admission application and it is currently under review.`)}
    ${infoTable(`
      ${infoRow('Application ID', applicationId)}
      ${infoRow('Course Applied', courseTitle)}
      ${infoRow('Date Submitted', new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }))}
      ${infoRow('Current Status', badge('Under Review', 'blue'))}
    `)}
    ${paragraph('Our admissions team will review your application and notify you of the decision within 3-5 working days.')}
    ${paragraph('Thank you for choosing Kingswell College. We look forward to welcoming you.')}
  `);
}

// 2. Admission Accepted
function admissionAcceptedHtml({ firstName, lastName, admissionNumber, courseTitle }) {
  return baseTemplate(`
    ${heading('Congratulations! 🎉')}
    ${subheading('Admission Accepted')}
    ${paragraph(`Dear <strong style="color:#fff;">${firstName} ${lastName}</strong>,`)}
    ${paragraph(`We are delighted to inform you that your admission application to <strong style="color:#d4af37;">${COLLEGE}</strong> has been <strong style="color:#34d399;">accepted</strong>!`)}
    ${infoTable(`
      ${infoRow('Admission Number', admissionNumber)}
      ${infoRow('Course', courseTitle)}
      ${infoRow('Status', badge('ACCEPTED', 'green'))}
    `)}
    ${paragraph('Please login to your student portal to access your ID card, timetable, results, and fee information.')}
    ${paragraph('Welcome to the Kingswell College family!')}
  `);
}

// 3. Admission Rejected
function admissionRejectedHtml({ firstName, lastName, courseTitle }) {
  return baseTemplate(`
    ${heading('Application Update')}
    ${subheading('Admission Decision')}
    ${paragraph(`Dear <strong style="color:#fff;">${firstName} ${lastName}</strong>,`)}
    ${paragraph(`After careful review of your application for <strong style="color:#d4af37;">${courseTitle}</strong>, we regret to inform you that we are unable to offer you admission at this time.`)}
    ${infoTable(`
      ${infoRow('Course Applied', courseTitle)}
      ${infoRow('Status', badge('NOT ACCEPTED', 'red'))}
    `)}
    ${paragraph('This decision was made considering many factors, and we encourage you to reapply in future intake periods. We wish you all the best in your academic journey.')}
  `);
}

// 4. Result Published
function resultPublishedHtml({ firstName, lastName, semester, examType, overallGrade, overallPercentage }) {
  const gradeColor = overallPercentage >= 80 ? 'green' : overallPercentage >= 60 ? 'gold' : overallPercentage >= 40 ? 'orange' : 'red';
  return baseTemplate(`
    ${heading('Your Results Are Out!')}
    ${subheading('Exam Results Published')}
    ${paragraph(`Dear <strong style="color:#fff;">${firstName} ${lastName}</strong>,`)}
    ${paragraph(`Your results for <strong style="color:#d4af37;">${semester}</strong> — <strong style="color:#d4af37;">${examType}</strong> have been published.`)}
    ${infoTable(`
      ${infoRow('Semester', semester)}
      ${infoRow('Exam Type', examType)}
      ${infoRow('Overall Grade', badge(overallGrade, gradeColor))}
      ${infoRow('Percentage', `${overallPercentage}%`)}
    `)}
    ${paragraph('Login to your student portal to view your detailed subject-wise marks and grades.')}
  `);
}

// 5. Fee Due Reminder
function feeDueReminderHtml({ firstName, lastName, feeType, semester, totalAmount, dueDate }) {
  const formattedDate = new Date(dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  return baseTemplate(`
    ${heading('Fee Payment Reminder')}
    ${subheading('Action Required')}
    ${paragraph(`Dear <strong style="color:#fff;">${firstName} ${lastName}</strong>,`)}
    ${paragraph(`This is a reminder that your fee payment is due. Please make the payment before the due date to avoid any late penalties.`)}
    ${infoTable(`
      ${infoRow('Fee Type', feeType)}
      ${infoRow('Semester', semester)}
      ${infoRow('Amount Due', `₹${totalAmount.toLocaleString()}`)}
      ${infoRow('Due Date', formattedDate)}
      ${infoRow('Status', badge('PAYMENT DUE', 'orange'))}
    `)}
    ${paragraph('Please login to your student portal to view your fee details and make the payment.')}
    ${paragraph('If you have already made the payment, please disregard this reminder.')}
  `);
}

// 6. New Notice
function newNoticeHtml({ title, message, category }) {
  return baseTemplate(`
    ${heading('New Notice Posted')}
    ${subheading(`${category ? category.toUpperCase() : 'GENERAL'} ANNOUNCEMENT`)}
    ${paragraph(`<strong style="color:#fff;">${title}</strong>`)}
    ${paragraph(message)}
    ${paragraph('Please login to your student portal for more details.')}
  `);
}

// 7. Custom/Broadcast Email
function customEmailHtml({ subject, body }) {
  return baseTemplate(`
    ${heading(subject)}
    ${subheading('Message from Kingswell College')}
    ${paragraph(body.replace(/\n/g, '<br/>'))}
  `);
}

// ═══════════════════════════════════════════════════════════════
// SEND FUNCTIONS
// ═══════════════════════════════════════════════════════════════

async function sendEmail({ to, subject, html }) {
  // If email not configured, log and skip (don't break app)
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_gmail@gmail.com') {
    console.log(`[EMAIL SKIPPED — not configured] To: ${to} | Subject: ${subject}`);
    return { skipped: true };
  }
  try {
    const info = await transporter.sendMail({ from: FROM, to, subject, html });
    console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject} | ID: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[EMAIL ERROR] To: ${to} | ${err.message}`);
    return { error: err.message };
  }
}

// Named send helpers (fire-and-forget — don't await in controllers unless needed)
const emailService = {
  sendApplicationReceived: (data) =>
    sendEmail({
      to: data.email,
      subject: `Application Received — ${data.courseTitle} | ${COLLEGE}`,
      html: applicationReceivedHtml(data),
    }),

  sendAdmissionAccepted: (data) =>
    sendEmail({
      to: data.email,
      subject: `Congratulations! Your Admission is Confirmed — ${COLLEGE}`,
      html: admissionAcceptedHtml(data),
    }),

  sendAdmissionRejected: (data) =>
    sendEmail({
      to: data.email,
      subject: `Admission Application Update — ${COLLEGE}`,
      html: admissionRejectedHtml(data),
    }),

  sendResultPublished: (data) =>
    sendEmail({
      to: data.email,
      subject: `Results Published: ${data.semester} ${data.examType} — ${COLLEGE}`,
      html: resultPublishedHtml(data),
    }),

  sendFeeDueReminder: (data) =>
    sendEmail({
      to: data.email,
      subject: `Fee Payment Reminder — ${COLLEGE}`,
      html: feeDueReminderHtml(data),
    }),

  sendNewNotice: (data) =>
    sendEmail({
      to: data.email,
      subject: `Notice: ${data.title} — ${COLLEGE}`,
      html: newNoticeHtml(data),
    }),

  sendCustomEmail: ({ to, subject, body }) =>
    sendEmail({ to, subject, html: customEmailHtml({ subject, body }) }),

  // Broadcast to multiple recipients (bcc for privacy)
  sendBroadcast: async ({ recipients, subject, body }) => {
    const results = [];
    for (const to of recipients) {
      const r = await emailService.sendCustomEmail({ to, subject, body });
      results.push({ to, ...r });
    }
    return results;
  },
};

module.exports = emailService;
