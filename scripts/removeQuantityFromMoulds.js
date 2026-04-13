const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Mould = require('../models/Mould');

const run = async () => {
  await connectDB();

  const result = await Mould.updateMany(
    { quantity: { $exists: true } },
    { $unset: { quantity: '' } }
  );

  console.log(
    `Removed quantity from ${result.modifiedCount || 0} mould records (matched ${result.matchedCount || 0}).`
  );

  await mongoose.connection.close();
};

run().catch((error) => {
  console.error('Failed to remove quantity field:', error);
  process.exit(1);
});
