const nodemailer = require('nodemailer')

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
})

async function sendVerificationEmail(email, name, token) {
  const link = `${CLIENT_URL}/verify-email?token=${token}`
  try {
    await transporter.sendMail({
      from: `"Aggie StudyBuddy 🐾" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Verify your Aggie StudyBuddy account 🐾',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color:#0039A6;">Welcome to Aggie StudyBuddy, ${name}! 🐾</h2>
          <p>Click the button below to verify your email and get started.</p>
          <a href="${link}" style="display:inline-block; background:#FFB81C; color:#0039A6; font-weight:bold; padding:12px 24px; border-radius:12px; text-decoration:none; margin-top:12px;">Verify Email</a>
          <p style="margin-top:20px; color:#888; font-size:12px;">If you didn't create this account, you can ignore this email.</p>
        </div>
      `
    })
    console.log('Verification email sent to:', email)
  } catch (err) {
    console.error('Failed to send verification email:', err)
  }
}

async function sendPasswordResetEmail(email, name, token) {
  const link = `${CLIENT_URL}/reset-password?token=${token}`
  try {
    await transporter.sendMail({
      from: `"Aggie StudyBuddy 🐾" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Reset your Aggie StudyBuddy password',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color:#0039A6;">Password Reset Request</h2>
          <p>Hi ${name}, click the button below to reset your password. This link expires in 1 hour.</p>
          <a href="${link}" style="display:inline-block; background:#0039A6; color:white; font-weight:bold; padding:12px 24px; border-radius:12px; text-decoration:none; margin-top:12px;">Reset Password</a>
          <p style="margin-top:20px; color:#888; font-size:12px;">If you didn't request this, you can ignore this email.</p>
        </div>
      `
    })
    console.log('Password reset email sent to:', email)
  } catch (err) {
    console.error('Failed to send password reset email:', err)
  }
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail }