// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: testEmail.js                                        ║
// ║  PATH: backend/testEmail.js                                ║
// ║                                                            ║
// ║  KYA HAI? → Test script hai email configuration check ke   ║
// ║  liye. Run: `node testEmail.js`                            ║
// ║  → Gmail se test email bhejta hai verify karne ke liye.    ║
// ╚══════════════════════════════════════════════════════════════╝
const nodemailer = require('nodemailer');

async function main() {
  // Auto-create a free Ethereal test account
  console.log('Creating Ethereal test account...');
  const testAccount = await nodemailer.createTestAccount();

  console.log('\n========================================');
  console.log('  ETHEREAL TEST CREDENTIALS');
  console.log('========================================');
  console.log('  User    :', testAccount.user);
  console.log('  Password:', testAccount.pass);
  console.log('  SMTP    : smtp.ethereal.email:587');
  console.log('========================================\n');

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
    tls: { rejectUnauthorized: false },
  });

  // Send admission accepted email (HTML template from emailService)
  const info = await transporter.sendMail({
    from: 'Kingswell College <no-reply@kingswellcollege.ac.ke>',
    to: testAccount.user,
    subject: 'Congratulations! Your Admission is Confirmed — Kingswell College',
    html: `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#0a0a0f;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#141420;border-radius:20px;overflow:hidden;border:1px solid rgba(212,175,55,0.2);">
  <tr><td style="background:linear-gradient(135deg,#d4af37,#f0d060,#a0821a);padding:24px 32px;">
    <span style="color:#0a0a0f;font-weight:bold;font-size:20px;">K &nbsp; Kingswell College</span>
    <span style="float:right;color:rgba(10,10,15,0.6);font-size:11px;letter-spacing:2px;">OFFICIAL COMMUNICATION</span>
  </td></tr>
  <tr><td style="padding:32px;">
    <h1 style="margin:0 0 8px;color:#d4af37;font-size:22px;">Congratulations! 🎉</h1>
    <p style="margin:0 0 24px;color:rgba(255,255,255,0.5);font-size:13px;letter-spacing:1px;text-transform:uppercase;">Admission Accepted</p>
    <p style="color:rgba(255,255,255,0.8);font-size:14px;line-height:1.7;">Dear <strong style="color:#fff;">Rahul Sharma</strong>,</p>
    <p style="color:rgba(255,255,255,0.8);font-size:14px;line-height:1.7;">We are delighted to inform you that your admission application to <strong style="color:#d4af37;">Kingswell College</strong> has been <strong style="color:#34d399;">accepted</strong>!</p>
    <table width="100%" style="background:#0f0f1a;border-radius:12px;margin:20px 0;border:1px solid rgba(212,175,55,0.1);">
      <tr><td style="padding:8px 12px;color:rgba(255,255,255,0.4);font-size:12px;">Admission Number</td><td style="padding:8px 12px;color:#fff;font-size:13px;font-weight:bold;">ADM-2026-001</td></tr>
      <tr><td style="padding:8px 12px;color:rgba(255,255,255,0.4);font-size:12px;">Course</td><td style="padding:8px 12px;color:#fff;font-size:13px;font-weight:bold;">B.Sc Computer Science</td></tr>
      <tr><td style="padding:8px 12px;color:rgba(255,255,255,0.4);font-size:12px;">Status</td><td style="padding:8px 12px;"><span style="padding:4px 14px;border-radius:999px;background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.3);color:#34d399;font-size:12px;font-weight:bold;">ACCEPTED</span></td></tr>
    </table>
    <p style="color:rgba(255,255,255,0.8);font-size:14px;line-height:1.7;">Welcome to the Kingswell College family!</p>
  </td></tr>
  <tr><td style="border-top:1px solid rgba(212,175,55,0.1);padding:20px 32px;background:#0f0f1a;">
    <p style="margin:0;color:rgba(255,255,255,0.3);font-size:11px;text-align:center;">Official email from Kingswell College &copy; 2026</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`
  });

  console.log('EMAIL SENT SUCCESSFULLY!');
  console.log('\n========================================');
  console.log('  PREVIEW EMAIL HERE (click to open):');
  console.log(' ', nodemailer.getTestMessageUrl(info));
  console.log('========================================\n');
}

main().catch(console.error);
