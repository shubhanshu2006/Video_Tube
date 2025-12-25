import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const emailTemplate = (verificationUrl, fullName) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      min-height: 100vh;
      padding: 20px;
    }

    .container {
      width: 100%;
      max-width: 600px;
      margin: 40px auto;
      padding: 0 20px;
    }

    .card {
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 50px 40px;
      text-align: center;
      color: #ffffff;
      position: relative;
      overflow: hidden;
    }

    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: pulse 15s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }

    .header-icon {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .header-icon::before {
      content: '✉';
      font-size: 40px;
      color: #ffffff;
    }

    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 0.5px;
      position: relative;
      z-index: 1;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }

    .content {
      padding: 50px 40px;
      color: #333333;
      line-height: 1.8;
      background: linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%);
    }

    .greeting-box {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      padding: 25px;
      border-radius: 15px;
      margin-bottom: 30px;
      border-left: 5px solid #764ba2;
      box-shadow: 0 5px 15px rgba(240, 147, 251, 0.3);
    }

    .greeting-box h2 {
      margin: 0 0 10px 0;
      font-size: 26px;
      color: #ffffff;
      font-weight: 700;
    }

    .content p {
      font-size: 16px;
      margin: 20px 0;
      color: #4b5563;
      line-height: 1.8;
    }

    .highlight {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 700;
    }

    .button-wrapper {
      text-align: center;
      margin: 40px 0;
    }

    .verify-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      padding: 18px 50px;
      border-radius: 50px;
      text-decoration: none;
      font-size: 18px;
      font-weight: 700;
      display: inline-block;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
      transition: all 0.3s ease;
      border: 2px solid transparent;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .verify-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
    }

    .info-box {
      background: #fff9e6;
      border-left: 4px solid #fbbf24;
      padding: 20px;
      border-radius: 10px;
      margin: 25px 0;
      box-shadow: 0 2px 10px rgba(251, 191, 36, 0.1);
    }

    .info-box p {
      margin: 0;
      color: #92400e;
      font-size: 15px;
    }

    .divider {
      height: 2px;
      background: linear-gradient(to right, transparent, #667eea, transparent);
      margin: 30px 0;
      border-radius: 2px;
    }

    .footer {
      padding: 30px 40px;
      background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
      text-align: center;
      font-size: 13px;
      color: #9ca3af;
      border-top: 3px solid #667eea;
    }

    .footer-content {
      max-width: 400px;
      margin: 0 auto;
    }

    .footer strong {
      color: #ffffff;
    }

    @media only screen and (max-width: 600px) {
      .header, .content, .footer {
        padding: 30px 20px;
      }

      .header h1 {
        font-size: 26px;
      }

      .greeting-box h2 {
        font-size: 22px;
      }

      .verify-button {
        padding: 15px 35px;
        font-size: 16px;
      }
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="card">

      <div class="header">
        <div class="header-icon"></div>
        <h1>Verify Your Email</h1>
      </div>

      <div class="content">
        <div class="greeting-box">
          <h2>Hello ${fullName}! </h2>
        </div>

        <p>
          Hello, I'm <span class="highlight">Shubhanshu Singh</span>, and I'm delighted to welcome you to my platform, <span class="highlight">Video Tube</span>  
          Please verify your email address to activate your account.
        </p>

        <div class="divider"></div>

        <div class="button-wrapper">
          <a href="${verificationUrl}" class="verify-button">
            Verify Email Address
          </a>
        </div>

        <div class="divider"></div>

        <div class="info-box">
          <p>
             This link will expire in <strong>24 hours</strong>.  
            If you didn't sign up, you can safely ignore this email.
          </p>
        </div>
      </div>

      <div class="footer">
        <div class="footer-content">
          © ${new Date().getFullYear()} <strong>Video Tube</strong>. All rights reserved.<br />
          This is an automated email — please do not reply.
        </div>
      </div>

    </div>
  </div>
</body>
</html>
`;

export const sendVerificationEmail = async (email, fullName, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Video Tube" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email address",
    html: emailTemplate(verificationUrl, fullName),
  });
};
