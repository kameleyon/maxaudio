const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Email templates
const templates = {
  verification: (token) => ({
    subject: 'Verify your AudioMax account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #63248d;">Welcome to AudioMax!</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}" 
           style="display: inline-block; background: #63248d; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Verify Email
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${process.env.FRONTEND_URL}/verify-email?token=${token}</p>
        <p>This link will expire in 24 hours.</p>
      </div>
    `
  }),
  
  resetPassword: (token) => ({
    subject: 'Reset your AudioMax password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #63248d;">Reset Your Password</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}" 
           style="display: inline-block; background: #63248d; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${process.env.FRONTEND_URL}/reset-password?token=${token}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
  })
};

// Generate verification token
const generateVerificationToken = (email) => {
  return jwt.sign(
    { email, purpose: 'email_verification' },
    process.env.JWT_SECRET || 'default_jwt_secret',
    { expiresIn: '24h' }
  );
};

// Generate password reset token
const generatePasswordResetToken = (email) => {
  return jwt.sign(
    { email, purpose: 'password_reset' },
    process.env.JWT_SECRET || 'default_jwt_secret',
    { expiresIn: '1h' }
  );
};

// Verify token
const verifyToken = (token, purpose) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret');
    if (decoded.purpose !== purpose) {
      throw new Error('Invalid token purpose');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Send email
const sendEmail = async (to, template) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: template.subject,
      html: template.html
    });
    
    console.log('Email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email');
  }
};

// Send verification email
const sendVerificationEmail = async (email) => {
  const token = generateVerificationToken(email);
  return sendEmail(email, templates.verification(token));
};

// Send password reset email
const sendPasswordResetEmail = async (email) => {
  const token = generatePasswordResetToken(email);
  return sendEmail(email, templates.resetPassword(token));
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  verifyToken,
  generateVerificationToken,
  generatePasswordResetToken
};
