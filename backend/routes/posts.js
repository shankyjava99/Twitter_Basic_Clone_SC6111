const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Create a new post
router.post('/create', authenticateToken, [
    body('content').isLength({ min: 1, max: 280 }).withMessage('Post content must be between 1 and 280 characters')
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { content } = req.body;
        const userId = req.user.userId;

        db.run('INSERT INTO posts (user_id, content) VALUES (?, ?)', [userId, content], function (err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to create post' });
            }

            res.status(201).json({
                success: true,
                message: 'Post created successfully',
                post: {
                    id: this.lastID,
                    user_id: userId,
                    content,
                    created_at: new Date().toISOString()
                }
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get all posts
router.get('/all', authenticateToken, (req, res) => {
    try {
        db.all(`
      SELECT p.*, u.username 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      ORDER BY p.created_at DESC
    `, [], (err, rows) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to fetch posts' });
            }

            res.json({
                success: true,
                posts: rows
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get posts by a specific user
router.get('/user/:userId', authenticateToken, (req, res) => {
    try {
        const { userId } = req.params;

        db.all(`
      SELECT p.*, u.username 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `, [userId], (err, rows) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to fetch user posts' });
            }

            res.json({
                success: true,
                posts: rows
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
