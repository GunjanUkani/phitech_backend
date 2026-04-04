const Product = require('../models/Product');

// Get all products (Public)
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a product (Admin only)
const createProduct = async (req, res) => {
  const { name, description, price } = req.body;
  const isPublic = req.body.isPublic === 'true' || req.body.isPublic === true;
  
  // Photos from multer
  let photoUrls = [];
  if (req.files && req.files.length > 0) {
    photoUrls = req.files.map(file => `/uploads/${file.filename}`);
  } else if (req.body.photos && typeof req.body.photos === 'string') {
    // Just in case it's a URL string
    photoUrls = [req.body.photos];
  } else if (req.body.photos && Array.isArray(req.body.photos)) {
    photoUrls = req.body.photos;
  }

  try {
    const product = await Product.create({
      name,
      description,
      price,
      photos: photoUrls,
      isPublic
    });
    res.status(201).json(product);
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

module.exports = { getProducts, createProduct, deleteProduct };
