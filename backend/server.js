require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection with better error handling
// Database Connection with better error handling
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        // If already connected, return true
        if (mongoose.connection.readyState === 1) {
            return true;
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000, // 30 seconds timeout
            socketTimeoutMS: 45000
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        if (mongoose.connection.listeners('error').length === 0) {
            mongoose.connection.on('error', (err) => {
                console.error('MongoDB connection error:', err);
            });
        }

        if (mongoose.connection.listeners('disconnected').length === 0) {
            mongoose.connection.on('disconnected', () => {
                console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
            });
        }

        return true;
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        // Don't exit process in serverless environment
        if (process.env.NODE_ENV !== 'production') {
            console.error('Please check your MONGODB_URI in the .env file');
        }
        throw error;
    }
};

// Middleware to check DB connection before handling requests
const checkDBConnection = async (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        try {
            await connectDB();
        } catch (error) {
            return res.status(503).json({
                error: 'Database connection not available. Please try again in a moment.'
            });
        }
    }
    next();
};

// Routes
app.use('/api/auth', checkDBConnection, require('./routes/auth'));
app.use('/api/forms', checkDBConnection, require('./routes/forms'));
app.use('/api/submissions', checkDBConnection, require('./routes/submissions'));

app.get('/', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({
        message: 'AI Form Generator API is running...',
        database: dbStatus,
        mongodb_state: mongoose.connection.readyState
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1;
    res.status(dbStatus ? 200 : 503).json({
        status: dbStatus ? 'healthy' : 'unhealthy',
        database: dbStatus ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Start Server
const startServer = async () => {
    try {
        // Connect to MongoDB first
        await connectDB();

        // Then start the server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 API available at http://localhost:${PORT}`);
            console.log(`💚 Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

if (require.main === module) {
    startServer();
}

module.exports = app;
