/**
 * Firebase Cloud Function for automatic email confirmation.
 * Triggered automatically whenever a new document is written to /inquiries/{inquiryId} in Firestore.
 * 
 * To deploy:
 *   cd functions && npm install
 *   firebase deploy --only functions
 */

const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const nodemailer = require('nodemailer');

// Configure your SMTP credentials in Firebase environment or Secret Manager
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'akhtarshadman044@gmail.com',
    pass: process.env.SMTP_PASS, // App password
  },
});

exports.onInquiryCreatedSendEmail = onDocumentCreated('inquiries/{inquiryId}', async (event) => {
  const snap = event.data;
  if (!snap) {
    console.log('No data associated with the event');
    return;
  }
  const data = snap.data();
  const inquiryId = event.params.inquiryId;

  if (!data.email) {
    console.log(`Inquiry #${inquiryId} has no recipient email.`);
    return;
  }

  const mailOptions = {
    from: 'FIXER Pakistan <akhtarshadman044@gmail.com>',
    to: data.email,
    subject: `[FIXER] Inquiry Confirmation #${inquiryId} - ${data.subject || data.category}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0b3b38;">Inquiry Confirmation - FIXER Pakistan</h2>
        <p>Dear ${data.name},</p>
        <p>Your inquiry has been successfully received by our system.</p>
        <p><strong>Reference:</strong> #${inquiryId}</p>
        <p><strong>Category:</strong> ${data.category || 'General'}</p>
        <p><strong>City:</strong> ${data.city || 'Pakistan'}</p>
        <p><strong>Message:</strong></p>
        <blockquote style="background: #f8fafc; padding: 10px; border-left: 3px solid #0b3b38;">${data.message}</blockquote>
        <p>Our team will get back to you within 2 hours.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="font-size: 12px; color: #64748b;">
          FIXER • <a href="https://fixer-pak.netlify.app">fixer-pak.netlify.app</a><br>
          Lead Developer: Shadman Akhtar (akhtarshadman044@gmail.com)
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Confirmation email dispatched to ${data.email}. MessageId: ${info.messageId}`);
    // Mark emailSent on the inquiry document
    await snap.ref.update({
      emailConfirmationSent: true,
      emailSentAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to dispatch cloud confirmation email:', error);
  }
});
