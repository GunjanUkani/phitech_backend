const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('DB connected');
  try {
    const adminExists = await User.findOne({ email: 'admin@phitech.com' });
    if (!adminExists) {
      const admin = await User.create({
        email: 'admin@phitech.com',
        password: 'admin',
        isAdmin: true
      });
      console.log('Admin created:', admin);
    } else {
      console.log('Admin already exists');
    }
  } catch(e) {
    console.error(e);
  }
  process.exit();
}).catch(e => {
  console.log(e);
  process.exit(1);
});
