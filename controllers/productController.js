const Product = require('../models/Product');
const path = require('path');
const { put } = require('@vercel/blob');

// Get all products (Public)
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).populate('category');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a product (Admin only)
const createProduct = async (req, res) => {
  const { name, description, category } = req.body;
  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required' });
  }
  const isPublic = req.body.isPublic === 'true' || req.body.isPublic === true;
  const shouldUseBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL);
  
  // Photos from multer
  let photoUrls = [];
  if (req.files && req.files.length > 0) {
    if (shouldUseBlob) {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return res.status(500).json({
          message: 'BLOB_READ_WRITE_TOKEN is not configured on the server.'
        });
      }

      try {
        const uploads = await Promise.all(
          req.files.map(async (file) => {
            const original = file.originalname || 'product';
            const ext = path.extname(original);
            const base = path
              .basename(original, ext)
              .replace(/[^a-zA-Z0-9-_]/g, '_')
              .slice(0, 60) || 'product';

            const blob = await put(
              `products/${base}${ext || ''}`,
              file.buffer,
              {
                access: 'public',
                addRandomSuffix: true,
                contentType: file.mimetype,
                token: process.env.BLOB_READ_WRITE_TOKEN
              }
            );

            return blob.url;
          })
        );
        photoUrls = uploads;
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    } else {
      photoUrls = req.files.map(file => `/uploads/${file.filename}`);
    }
  }

  try {
    const product = await Product.create({
      name,
      description,
      category,
      photos: photoUrls,
      isPublic
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a product (Admin only)
const updateProduct = async (req, res) => {
    const { name, description, category } = req.body;
    const isPublic = req.body.isPublic === 'true' || req.body.isPublic === true;
    const shouldUseBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL);
    
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.category = category || product.category;
        product.isPublic = isPublic !== undefined ? isPublic : product.isPublic;

        if (req.files && req.files.length > 0) {
            let newPhotoUrls = [];
            if (shouldUseBlob) {
                const uploads = await Promise.all(
                    req.files.map(async (file) => {
                        const original = file.originalname || 'product';
                        const ext = path.extname(original);
                        const base = path.basename(original, ext).replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 60);
                        const blob = await put(`products/${base}${ext}`, file.buffer, {
                            access: 'public',
                            addRandomSuffix: true,
                            contentType: file.mimetype,
                            token: process.env.BLOB_READ_WRITE_TOKEN
                        });
                        return blob.url;
                    })
                );
                newPhotoUrls = uploads;
            } else {
                newPhotoUrls = req.files.map(file => `/uploads/${file.filename}`);
            }
            product.photos = [...product.photos, ...newPhotoUrls];
        }

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a product (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
