const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();

// Routes
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Middleware to log request body size for diagnostics
app.use((req, res, next) => {
  if (req.body && req.method === 'POST') {
    const size = JSON.stringify(req.body).length;
    console.log(`[DIAGNOSTIC] ${req.method} ${req.path} - Body size: ${(size / 1024 / 1024).toFixed(2)} MB`);
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[CRITICAL SERVER ERROR]', err);
  res.status(500).json({
    message: 'Internal server error',
    error: err.message,
    path: req.path,
    stack: process.env.NODE_ENV === 'development' ? err.stack : 'N/A'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
