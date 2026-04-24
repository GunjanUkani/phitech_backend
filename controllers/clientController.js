const Client = require('../models/Client');

// @desc    Get all clients
// @route   GET /api/clients
// @access  Public
const getClients = async (req, res) => {
  try {
    const clients = await Client.find({});
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a client
// @route   POST /api/clients
// @access  Private/Admin
const createClient = async (req, res) => {
  try {
    const { name, link } = req.body;
    let image = '';

    if (req.file) {
      if (process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL) {
        const { put } = require('@vercel/blob');
        const blob = await put(`clients/${req.file.originalname}`, req.file.buffer, { 
          access: 'public',
          addRandomSuffix: true,
          token: process.env.BLOB_READ_WRITE_TOKEN
        });
        image = blob.url;
      } else {
        image = `/uploads/${req.file.filename}`;
      }
    } else {
      return res.status(400).json({ message: 'Image is required' });
    }

    const client = new Client({ name, link, image });
    const createdClient = await client.save();
    res.status(201).json(createdClient);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a client
// @route   PUT /api/clients/:id
// @access  Private/Admin
const updateClient = async (req, res) => {
  try {
    const { name, link } = req.body;
    const client = await Client.findById(req.params.id);

    if (client) {
      client.name = name || client.name;
      client.link = link !== undefined ? link : client.link;

      if (req.file) {
        if (process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL) {
          const { put } = require('@vercel/blob');
          const blob = await put(`clients/${req.file.originalname}`, req.file.buffer, { 
            access: 'public',
            addRandomSuffix: true,
            token: process.env.BLOB_READ_WRITE_TOKEN
          });
          client.image = blob.url;
        } else {
          client.image = `/uploads/${req.file.filename}`;
        }
      }

      const updatedClient = await client.save();
      res.json(updatedClient);
    } else {
      res.status(404).json({ message: 'Client not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a client
// @route   DELETE /api/clients/:id
// @access  Private/Admin
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (client) {
      await client.deleteOne();
      res.json({ message: 'Client removed' });
    } else {
      res.status(404).json({ message: 'Client not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getClients, createClient, updateClient, deleteClient };
