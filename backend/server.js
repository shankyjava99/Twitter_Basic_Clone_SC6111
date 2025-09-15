const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { router: authRoutes } = require('./routes/auth');
const postRoutes = require('./routes/posts');
const { initDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Initialize database and start server
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
