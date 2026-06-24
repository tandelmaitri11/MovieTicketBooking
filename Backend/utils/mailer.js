const nodemailer = require("nodemailer");

const getTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();
  if (!transporter || !to) return;

  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  await transporter.sendMail({ from, to, subject, text, html });
};

const buildGreeting = (name) => {
  const safeName = name ? name.trim() : "";
  return safeName ? `Hi ${safeName},` : "Hi,";
};

/* =========================
   ✅ UI HELPERS (HTML only)
========================= */

const brand = {
  name: "Movie Ticket Booking",
  primary: "#E11D48", // close to red-600
  bg: "#0B0B0F",
  card: "#111827",
  text: "#E5E7EB",
  muted: "#9CA3AF",
  border: "#1F2937",
};

const escapeHtml = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const emailLayout = ({ title, greeting, bodyHtml, footerNote }) => `
  <div style="margin:0;padding:0;background:${brand.bg};font-family:Arial,Helvetica,sans-serif;color:${brand.text};">
    <div style="max-width:640px;margin:0 auto;padding:28px 16px;">
      
      <!-- Header -->
      <div style="padding:18px 20px;border:1px solid ${brand.border};border-radius:16px;background:linear-gradient(135deg, rgba(225,29,72,0.20), rgba(17,24,39,0.95));">
        <div style="font-size:14px;letter-spacing:2px;text-transform:uppercase;color:${brand.muted};">
          ${brand.name}
        </div>
        <div style="margin-top:8px;font-size:22px;font-weight:700;color:${brand.text};">
          ${escapeHtml(title)}
        </div>
      </div>

      <!-- Card -->
      <div style="margin-top:16px;padding:22px 20px;border:1px solid ${brand.border};border-radius:16px;background:${brand.card};">
        <p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;color:${brand.text};">
          ${escapeHtml(greeting)}
        </p>

        ${bodyHtml}

        <div style="margin-top:18px;border-top:1px solid ${brand.border};padding-top:14px;">
          <p style="margin:0;font-size:12px;line-height:1.6;color:${brand.muted};">
            ${escapeHtml(footerNote || "If you didn’t request this, you can safely ignore this email.")}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align:center;margin-top:14px;color:${brand.muted};font-size:12px;line-height:1.6;">
        <p style="margin:0;">© ${new Date().getFullYear()} ${brand.name}. All rights reserved.</p>
        <p style="margin:6px 0 0 0;">Need help? Reply to this email or contact support.</p>
      </div>

    </div>
  </div>
`;

const primaryButton = (href, label) => `
  <div style="margin:16px 0 6px 0;">
    <a href="${href}" style="
      display:inline-block;
      background:${brand.primary};
      color:#fff;
      text-decoration:none;
      padding:12px 16px;
      border-radius:12px;
      font-weight:700;
      font-size:14px;
    ">
      ${escapeHtml(label)}
    </a>
  </div>
`;

const infoRow = (label, value) => `
  <div style="margin-top:10px;padding:12px 14px;border:1px solid ${brand.border};border-radius:12px;background:#0f172a;">
    <div style="font-size:12px;color:${brand.muted};margin-bottom:6px;">${escapeHtml(label)}</div>
    <div style="font-size:14px;color:${brand.text};font-weight:700;word-break:break-all;">${escapeHtml(value)}</div>
  </div>
`;

/* =========================
   ✅ EMAILS (UI upgraded)
========================= */

exports.sendSignupEmail = async ({ to, name }) => {
  const greeting = buildGreeting(name);
  const subject = "Welcome to Movie Ticket Booking";

  const text = `${greeting}\n\nYour account has been created successfully. You can now browse movies, book tickets, and manage your profile.\n\nIf you didn’t create this account, please contact support.\n\nThanks,\nMovie Ticket Booking`;

  const bodyHtml = `
    <p style="margin:0;font-size:14px;line-height:1.8;color:${brand.text};">
      Your account is ready! You can now explore movies, book tickets, and manage your profile.
    </p>
    ${infoRow("What you can do next", "Browse movies • Choose seats • Book instantly")}
    <p style="margin:16px 0 0 0;font-size:13px;line-height:1.7;color:${brand.muted};">
      If you didn’t create this account, please contact support immediately.
    </p>
  `;

  const html = emailLayout({
    title: "Welcome 🎬",
    greeting,
    bodyHtml,
    footerNote: "If you didn’t create this account, please contact support immediately.",
  });

  await sendEmail({ to, subject, text, html });
};

exports.sendGoogleLoginEmail = async ({ to, name }) => {
  const greeting = buildGreeting(name);
  const subject = "Google Login Successful";

  const text = `${greeting}\n\nYou have successfully logged in with Google.\n\nIf this wasn’t you, please secure your account.\n\nThanks,\nMovie Ticket Booking`;

  const bodyHtml = `
    <p style="margin:0;font-size:14px;line-height:1.8;color:${brand.text};">
      You have successfully logged in using Google.
    </p>
    ${infoRow("Security tip", "If this wasn’t you, reset your password immediately.")}
  `;

  const html = emailLayout({
    title: "Login Alert",
    greeting,
    bodyHtml,
    footerNote: "If you didn’t do this, please secure your account immediately.",
  });

  await sendEmail({ to, subject, text, html });
};

exports.sendResetPasswordEmail = async ({ to, name, resetLink }) => {
  const greeting = buildGreeting(name);
  const subject = "Reset Your Password";

  const text = `${greeting}\n\nWe received a request to reset your password. Use the link below to set a new password:\n${resetLink}\n\nIf you didn’t request this, you can ignore this email.\n\nThanks,\nMovie Ticket Booking`;

  const bodyHtml = `
    <p style="margin:0;font-size:14px;line-height:1.8;color:${brand.text};">
      We received a request to reset your password. Click the button below to set a new password.
    </p>
    ${primaryButton(resetLink, "Reset Password")}
    <p style="margin:10px 0 0 0;font-size:12px;line-height:1.7;color:${brand.muted};">
      If the button doesn’t work, copy and paste this link:
    </p>
    ${infoRow("Reset link", resetLink)}
  `;

  const html = emailLayout({
    title: "Reset Password",
    greeting,
    bodyHtml,
    footerNote: "If you didn’t request a password reset, you can ignore this email.",
  });

  await sendEmail({ to, subject, text, html });
};

exports.sendOtpEmail = async ({ to, name, otp }) => {
  const greeting = buildGreeting(name);
  const subject = "Your Password Reset OTP";

  const text = `${greeting}\n\nYour OTP for password reset is: ${otp}\nThis OTP is valid for 10 minutes.\n\nIf you did not request this, you can ignore this email.\n\nThanks,\nMovie Ticket Booking`;

  const bodyHtml = `
    <p style="margin:0;font-size:14px;line-height:1.8;color:${brand.text};">
      Use the OTP below to reset your password. This code is valid for <b>10 minutes</b>.
    </p>

    <!-- OTP box -->
    <div style="
      margin:16px 0 8px 0;
      padding:16px;
      border-radius:16px;
      border:1px dashed rgba(255,255,255,0.18);
      background:rgba(0,0,0,0.25);
      text-align:center;
    ">
      <div style="font-size:12px;color:${brand.muted};letter-spacing:2px;text-transform:uppercase;">
        One-Time Password (OTP)
      </div>
      <div style="
        margin-top:10px;
        font-size:28px;
        font-weight:800;
        letter-spacing:10px;
        color:${brand.text};
      ">
        ${escapeHtml(String(otp || ""))}
      </div>
    </div>

    <p style="margin:0;font-size:12px;line-height:1.7;color:${brand.muted};text-align:center;">
      Do not share this OTP with anyone.
    </p>

    ${infoRow("Reminder", "If you didn’t request this, ignore this email.")}
  `;

  const html = emailLayout({
    title: "OTP Verification",
    greeting,
    bodyHtml,
    footerNote: "Never share your OTP with anyone. Our team will never ask for it.",
  });

  await sendEmail({ to, subject, text, html });
};
