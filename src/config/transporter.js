import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
export const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

export const sendPasswordResetEmail = async (recipient, subject, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipient,
      subject: subject,
      html: htmlContent,
    });
    console.log('✅ Email sent:', info.messageId);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
};

// export const mailOptions = (token) => {
//   from: process.env.EMAIL_USER,
//   to: user.email,
//   subject: 'Password Reset Link - Invoice Management System',
//   html: `<p>Your password reset token: <b>${token}</b></p>
//          <p>Reset your password here: <a href="${resetUrl}">${resetUrl}</a></p>`