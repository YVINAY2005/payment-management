import express from 'express';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all users' payment info with search and filter
router.get('/payments', auth, adminAuth, async (req, res) => {
    try {
        const { username, paymentType, bankName, ifscCode, paytmNumber, upiId, paypalEmail, usdtAddress } = req.query;
        
        let query = {};
        
        if (paymentType) query.paymentType = paymentType;
        if (bankName) query.bankName = new RegExp(bankName, 'i');
        if (ifscCode) query.ifscCode = new RegExp(ifscCode, 'i');
        if (paytmNumber) query.paytmNumber = new RegExp(paytmNumber, 'i');
        if (upiId) query.upiId = new RegExp(upiId, 'i');
        if (paypalEmail) query.paypalEmail = new RegExp(paypalEmail, 'i');
        if (usdtAddress) query.usdtAddress = new RegExp(usdtAddress, 'i');

        let payments = await Payment.find(query).populate('user', 'username email');

        if (username) {
            payments = payments.filter(p => p.user && p.user.username.toLowerCase().includes(username.toLowerCase()));
        }

        res.json(payments);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
