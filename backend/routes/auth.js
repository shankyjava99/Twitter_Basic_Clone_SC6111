const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Register endpoint
router.post('/register', [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { username, password } = req.body;

        // Check if user already exists
        db.get('SELECT id FROM users WHERE username = ?', [username], async (err, row) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            if (row) {
                return res.status(400).json({ success: false, message: 'Username already exists' });
            }

            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Insert new user
            db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Failed to create user' });
                }

                // Generate JWT token
                const token = jwt.sign(
                    { userId: this.lastID, username },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                res.status(201).json({
                    success: true,
                    message: 'User created successfully',
                    token,
                    user: { id: this.lastID, username }
                });
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Login endpoint
router.post('/login', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { username, password } = req.body;

        // Find user
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            // Check password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: { id: user.id, username: user.username }
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Verify token endpoint
router.get('/verify', authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

module.exports = { router, authenticateToken };
