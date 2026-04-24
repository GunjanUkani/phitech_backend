const nodemailer = require('nodemailer');

// @desc    Handle Contact Form Submission
// @route   POST /api/contact
// @access  Public
const submitContactForm = async (req, res) => {
  const { firstName, lastName, email, phone, service, message } = req.body;

  if (!firstName || !lastName || !email || !phone || !message) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }

  const textContent = `
New Inquiry from Website:

Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone}
Service: ${service || 'Not specified'}
Message: ${message}
  `;

  try {
    // 1. Send Email using Nodemailer
    // Note: You must configure EMAIL_USER and EMAIL_PASS in your .env file
    // Example: EMAIL_USER=your-email@gmail.com, EMAIL_PASS=your-app-password
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail', // or your preferred email service
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'info@phitech.co.in', // The destination email address
        subject: `Website Inquiry - ${firstName} ${lastName}`,
        text: textContent,
      };

      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } else {
      console.warn('Email credentials not configured in .env. Skipping email sending.');
    }

    // 2. Send WhatsApp Message
    // Note: Sending automated WhatsApp messages requires a Business API provider (like Twilio, Interakt, Wati, or Meta Cloud API).
    // You will need to add your API credentials in the .env file and uncomment the logic below.
    
    /* Example using a generic HTTP API (like Wati or Interakt):
    if (process.env.WHATSAPP_API_KEY) {
      const axios = require('axios');
      await axios.post('https://your-whatsapp-api-provider.com/v1/messages', {
        phone: '919428735418', // Destination WhatsApp number
        message: textContent
      }, {
        headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}` }
      });
      console.log('WhatsApp message sent successfully');
    }
    */

    res.status(200).json({ success: true, message: 'Inquiry submitted successfully.' });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ message: 'Failed to submit inquiry. Please try again later.' });
  }
};

module.exports = { submitContactForm };
