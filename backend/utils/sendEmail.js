const nodemailer = require("nodemailer");

// Uses Gmail SMTP with an App Password (not your normal Gmail password —
// see the .env.example comment for how to generate one). Swap this out for
// a transactional email provider (Resend, SendGrid, etc.) later if you
// outgrow Gmail's sending limits.
const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email is not configured on the server (missing EMAIL_USER/EMAIL_PASS)");
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  });
};

module.exports = sendEmail;
