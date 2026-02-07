const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Register (User only)
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ username, email, password, role: 'user' });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, username, email, role: 'user' } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Register (Removed from frontend, kept for direct DB management if needed)
// router.post('/admin-register', async (req, res) => { ... });

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Login attempt for: ${email}`);
        
        // Try User first
        let user = await User.findOne({ email });
        let isAdmin = false;

        // Try Admin if not found in User
        if (!user) {
            user = await Admin.findOne({ email });
            isAdmin = true;
            console.log(`Found in Admin collection: ${!!user}`);
        } else {
            console.log('Found in User collection');
        }

        if (!user) {
            console.log('User/Admin not found');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        console.log(`Password match: ${isMatch}`);
        
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ 
            token, 
            user: { 
                id: user._id, 
                username: user.username, 
                email, 
                role: isAdmin ? 'admin' : user.role 
            } 
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
