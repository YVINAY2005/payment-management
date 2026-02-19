import express from 'express';
import Payment from '../models/Payment.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all payments for logged in user
router.get('/', auth, async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user.id });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add payment method
router.post('/', auth, async (req, res) => {
    try {
        const payment = new Payment({
            ...req.body,
            user: req.user.id
        });
        await payment.save();
        res.json(payment);
    } catch (err) {
        console.error('Error adding payment:', err);
        res.status(500).json({ 
            message: 'Server error', 
            error: err.message,
            stack: err.stack 
        });
    }
});

// Update payment method
router.put('/:id', auth, async (req, res) => {
    try {
        let payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Payment method not found' });
        if (payment.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(payment);
    } catch (err) {
        console.error('Error updating payment:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Delete payment method
router.delete('/:id', auth, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Payment method not found' });
        if (payment.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        await payment.deleteOne();
        res.json({ message: 'Payment method removed' });
    } catch (err) {
        console.error('Error deleting payment:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

export default router;
