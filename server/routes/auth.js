const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Registration route
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        let usersDoc = await User.findOne({});
        
        if (!usersDoc) {
            usersDoc = new User({
                users: []
            });
            await usersDoc.save();
        }

        const existingUser = usersDoc.users.find(u => 
            u.username && u.username.toLowerCase() === username.toLowerCase().trim()
        );
        
        if (existingUser) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const newUser = {
            username: username.trim(),
            password_hash: passwordHash
        };

        usersDoc.users.push(newUser);
        await usersDoc.save();

        const token = jwt.sign(
            { 
                userId: username,
                username: username 
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: username,
                username: username
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed: ' + error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const usersDoc = await User.findOne({});
        
        if (!usersDoc || !usersDoc.users || usersDoc.users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = usersDoc.users.find(u => 
            u.username && u.username.toLowerCase() === username.toLowerCase().trim()
        );
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        if (!user.password_hash) {
            return res.status(500).json({ error: 'User data error' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { 
                userId: user.username,
                username: user.username 
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.username,
                username: user.username
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get current user info
router.get('/me', require('../middleware/auth'), async (req, res) => {
    try {
        const username = req.user.username;
        
        const usersDoc = await User.findOne({});
        
        if (!usersDoc || !usersDoc.users) {
            return res.status(404).json({ error: 'Users not found' });
        }
        
        const user = usersDoc.users.find(u => u.username === username);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user.username,
                username: user.username
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;