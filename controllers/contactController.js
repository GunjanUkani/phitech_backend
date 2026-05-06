const nodemailer = require('nodemailer');
const twilio = require('twilio');
const Contact = require('../models/Contact');

const sendWhatsAppNotification = async (text) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  console.log('Twilio SID:', sid ? 'Loaded' : 'Missing');
  if (!sid || !token || sid === 'your_account_sid_here') return;

  try {
    const client = twilio(sid, token);
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: process.env.WHATSAPP_TO,
      body: text,
    });
    console.log('WhatsApp notification sent via Twilio');
  } catch (err) {
    console.error('Twilio WhatsApp error:', err.message);
  }
};

// @desc    Handle Contact Form Submission
// @route   POST /api/contact
// @access  Public
const submitContactForm = async (req, res) => {
  const { firstName, lastName, email, phone, service, message } = req.body;

  if (!firstName || !lastName || !email || !phone || !message) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }

  try {
    // 1. Save to Database
    const newInquiry = await Contact.create({
      firstName,
      lastName,
      email,
      phone,
      service,
      message
    });

    // Send WhatsApp notification
    const whatsappText = `New Inquiry - PhiTECH Website\n\nName: ${firstName} ${lastName}\nPhone: ${phone}\nEmail: ${email}\nService: ${service || 'Not specified'}\nMessage: ${message}`;
    sendWhatsAppNotification(whatsappText);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; border: 1px solid #eee; border-top: 5px solid #e41e26; }
          .header { background: #e41e26; color: #ffffff; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; font-weight: 800; }
          .content { padding: 40px; background: #ffffff; }
          .content h2 { color: #1a1a1a; border-bottom: 2px solid #e41e26; padding-bottom: 10px; margin-top: 0; }
          .info-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .info-table td { padding: 12px; border-bottom: 1px solid #f0f0f0; }
          .info-table td.label { font-weight: bold; width: 150px; color: #666; }
          .message-box { background: #f9f9f9; padding: 20px; border-left: 4px solid #e41e26; margin-top: 25px; }
          .footer { background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #777; }
          .button { display: inline-block; padding: 12px 25px; background: #e41e26; color: white !important; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 30px; }
          .footer a { color: #e41e26; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PhiTECH Solutions</h1>
          </div>
          <div class="content">
            <h2>New Inquiry</h2>
            <p>You have received a new message from your website contact form. Here are the details:</p>
            
            <table class="info-table">
              <tr>
                <td class="label">Client Name</td>
                <td>${firstName} ${lastName}</td>
              </tr>
              <tr>
                <td class="label">Email Address</td>
                <td><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr>
                <td class="label">Phone Number</td>
                <td>${phone}</td>
              </tr>
              <tr>
                <td class="label">Service Requested</td>
                <td>${service || 'Not specified'}</td>
              </tr>
            </table>
            
            <div class="message-box">
              <strong>Message:</strong><br/>
              ${message.replace(/\n/g, '<br/>')}
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.ADMIN_URL || '#'}/admin/inquiries" class="button">View in Admin Panel</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} PhiTECH Solutions. All rights reserved.</p>
            <p>
              <a href="https://phitech.co.in">www.phitech.co.in</a> | 
              <a href="mailto:info@phitech.co.in">info@phitech.co.in</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // 2. Send Email using Nodemailer
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'mail.phitech.co.in',
          port: parseInt(process.env.EMAIL_PORT || '465'),
          secure: parseInt(process.env.EMAIL_PORT || '465') === 465,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        const mailOptions = {
          from: `"PhiTECH Website" <${process.env.EMAIL_USER}>`,
          to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
          subject: `🔔 Website Inquiry: ${firstName} ${lastName}`,
          html: htmlContent,
          text: `New Inquiry from ${firstName} ${lastName}. Email: ${email}. Phone: ${phone}. Message: ${message}`, // Fallback text
        };

        await transporter.sendMail(mailOptions);
        console.log('Professional inquiry email sent successfully');
      } catch (emailError) {
        console.error('Nodemailer Error:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry submitted successfully.',
      data: newInquiry
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ message: 'Failed to submit inquiry. Please try again later.' });
  }
};

// @desc    Get all inquiries (for Admin)
// @route   GET /api/contact
// @access  Private/Admin
const getInquiries = async (req, res) => {
  try {
    const inquiries = await Contact.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update inquiry status
// @route   PUT /api/contact/:id
// @access  Private/Admin
const updateInquiryStatus = async (req, res) => {
  try {
    const inquiry = await Contact.findById(req.params.id);
    if (inquiry) {
      inquiry.status = req.body.status || inquiry.status;
      const updatedInquiry = await inquiry.save();
      res.json(updatedInquiry);
    } else {
      res.status(404).json({ message: 'Inquiry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete inquiry
// @route   DELETE /api/contact/:id
// @access  Private/Admin
const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Contact.findById(req.params.id);
    if (inquiry) {
      await inquiry.deleteOne();
      res.json({ message: 'Inquiry removed' });
    } else {
      res.status(404).json({ message: 'Inquiry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitContactForm,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry
};
