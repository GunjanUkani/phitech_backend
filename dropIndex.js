const mongoose = require('mongoose');

// Fallback logic if dotenv isn't enough depending on path
mongoose.connect('mongodb://localhost:27017/phitech')
  .then(async () => {
    console.log('Connected to MongoDB');
    try {
      await mongoose.connection.collection('products').dropIndex('productId_1');
      console.log('Successfully dropped productId_1 index from products collection.');
    } catch(e) {
      console.log('Error dropping index:', e.message);
    }
    process.exit(0);
  });
