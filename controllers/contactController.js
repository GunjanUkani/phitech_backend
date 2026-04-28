const nodemailer = require('nodemailer');
const Contact = require('../models/Contact');

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

    const textContent = `
New Inquiry from Website:

Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone}
Service: ${service || 'Not specified'}
Message: ${message}

View all inquiries in the admin panel.
    `;

    // 2. Send Email using Nodemailer
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: `Website Inquiry - ${firstName} ${lastName}`,
        text: textContent,
      };

      await transporter.sendMail(mailOptions);
      console.log('Inquiry email sent successfully');
    } else {
      console.warn('Email credentials not configured in .env. Skipping email sending.');
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
