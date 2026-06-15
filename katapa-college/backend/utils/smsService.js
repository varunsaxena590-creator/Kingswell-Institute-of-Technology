// smsService.js
// Utility for sending SMS notifications (Twilio example)

const twilio = require('twilio');
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM;

let client = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

async function sendSMS(to, message) {
  if (!client) return { error: 'SMS service not configured' };
  try {
    const res = await client.messages.create({
      body: message,
      from: fromNumber,
      to,
    });
    return { sid: res.sid };
  } catch (err) {
    return { error: err.message };
  }
}

module.exports = { sendSMS };
