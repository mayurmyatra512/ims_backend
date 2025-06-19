import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Sends an invoice email using dynamic HTML content.
 * @param {string} recipient - The recipient email.
 * @param {string} subject - Email subject line.
 * @param {string} innerHtmlContent - The raw HTML string from React ref.
 */
export const sendEmail = async (recipient, subject, innerHtmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const documentContent = `
      <html>
        <head>
          <title>Invoice</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              * {
                box-shadow: none !important;
              }
              .no-print {
                display: none !important;
              }
              .page-break {
                page-break-before: always;
              }
            }
          </style>
        </head>
        <body class="bg-gray-100 p-4">
          ${innerHtmlContent}
        </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipient,
      subject: subject,
      html: documentContent,
    });

    console.log('✅ Email sent:', info.messageId);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
};
