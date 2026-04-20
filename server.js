const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Connect to Database
connectDB();

const app = express();

const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes Placeholder
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/moulds', require('./routes/mouldRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5137;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
