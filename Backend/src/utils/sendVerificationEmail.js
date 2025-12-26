import SibApiV3Sdk from "sib-api-v3-sdk";

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const transactionalEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const emailTemplate = (verificationUrl, fullName) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5;">
  <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 32px; font-weight: 700;">Verify Your Email</h1>
      </div>

      <!-- Content -->
      <div style="padding: 40px 20px; color: #333333; line-height: 1.6;">
        
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 8px; margin-bottom: 30px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 700;">Hello ${fullName}!</h2>
        </div>

        <p style="margin: 20px 0; font-size: 16px; color: #555;">
          Hello, I'm <strong>Shubhanshu Singh</strong>, and I'm delighted to welcome you to my platform, <strong>Video Tube</strong>. 
        </p>

        <p style="margin: 20px 0; font-size: 16px; color: #555;">
          Please verify your email address to activate your account.
        </p>

        <!-- Verification Button -->
        <div style="text-align: center; margin: 35px 0;">
          <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 15px 40px; border-radius: 50px; text-decoration: none; font-size: 16px; font-weight: 700; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
            Verify Email Address
          </a>
        </div>

        <!-- Info Box -->
        <div style="background: #fff9e6; border-left: 4px solid #fbbf24; padding: 20px; border-radius: 6px; margin: 25px 0;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>Important:</strong> This link will expire in <strong>24 hours</strong>. 
            If you didn't sign up, you can safely ignore this email.
          </p>
        </div>

      </div>

      <!-- Footer -->
      <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 25px 20px; text-align: center; color: #9ca3af; font-size: 13px; border-top: 3px solid #667eea;">
        <p style="margin: 0;">
          © ${new Date().getFullYear()} <strong style="color: #ffffff;">Video Tube</strong>. All rights reserved.
        </p>
        <p style="margin: 8px 0 0 0; font-size: 12px;">
          This is an automated email — please do not reply.
        </p>
      </div>

    </div>
  </div>
</body>
</html>
`;

export const sendVerificationEmail = async (email, fullName, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  try {
    await transactionalEmailApi.sendTransacEmail({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: process.env.BREVO_SENDER_NAME || "Video Tube",
      },
      to: [{ email }],
      subject: "Verify your email address",
      htmlContent: emailTemplate(verificationUrl, fullName),
    });

    console.log("Verification email sent via Brevo");
  } catch (error) {
    console.error(" Brevo email error:", error);
  }
};
