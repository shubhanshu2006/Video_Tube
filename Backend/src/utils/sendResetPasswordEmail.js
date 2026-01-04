import SibApiV3Sdk from "sib-api-v3-sdk";

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const transactionalEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const resetPasswordTemplate = (resetUrl, fullName) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Password</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,.1);">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:40px 20px;text-align:center;color:#fff;">
        <h1 style="margin:0;font-size:32px;font-weight:700;">Reset Your Password</h1>
      </div>

      <!-- Content -->
      <div style="padding:40px 20px;color:#333;line-height:1.6;">
        <div style="background:linear-gradient(135deg,#fb7185,#f43f5e);padding:20px;border-radius:8px;margin-bottom:30px;color:#fff;">
          <h2 style="margin:0;font-size:24px;">Hello ${fullName} </h2>
        </div>

        <p style="font-size:16px;color:#555;">
          We received a request to reset your <strong>Video Tube</strong> account password.
        </p>

        <div style="text-align:center;margin:35px 0;">
          <a href="${resetUrl}" style="background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;padding:15px 40px;border-radius:50px;text-decoration:none;font-size:16px;font-weight:700;display:inline-block;">
            Reset Password
          </a>
        </div>

        <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:20px;border-radius:6px;">
          <p style="margin:0;color:#991b1b;font-size:14px;">
            <strong>Security Notice:</strong> This link will expire in <strong>15 minutes</strong>.
            If you didn't request this, please ignore the email.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#111827;padding:25px 20px;text-align:center;color:#9ca3af;font-size:13px;">
        © ${new Date().getFullYear()} <strong style="color:#fff;">Video Tube</strong>. All rights reserved.
      </div>

    </div>
  </div>
</body>
</html>
`;

export const sendResetPasswordEmail = async (email, fullName, resetUrl) => {
  try {
    await transactionalEmailApi.sendTransacEmail({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: process.env.BREVO_SENDER_NAME || "Video Tube",
      },
      to: [{ email }],
      subject: "Reset your password",
      htmlContent: resetPasswordTemplate(resetUrl, fullName),
    });

    console.log("Reset password email sent successfully");
  } catch (error) {
    console.error("Brevo reset password email error:", error);
    throw error;
  }
};
