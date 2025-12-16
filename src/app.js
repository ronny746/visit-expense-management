const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const visitRoutes = require('./routes/visits');
const expenseRoutes = require('./routes/expenses');
const leaveRoutes = require('./routes/leaves');
const masterRoutes = require('./routes/masters');
const dashboardRoutes = require('./routes/dashboard');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/masters', masterRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});