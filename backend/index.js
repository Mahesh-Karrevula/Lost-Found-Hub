require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const itemRoutes = require('./routes/itemRoutes');
const authRoutes = require('./routes/authRoutes');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/items', itemRoutes);
app.use('/api/users', authRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('Lost and Found Hub API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
