const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    paymentType: {
        type: String,
        enum: ['Bank', 'Paytm', 'UPI', 'PayPal', 'USDT'],
        required: true
    },
    // Bank Fields
    ifscCode: String,
    branchName: String,
    bankName: String,
    accountNumber: String,
    accountHolderName: String,
    // Paytm
    paytmNumber: String,
    // UPI
    upiId: String,
    // PayPal
    paypalEmail: String,
    // USDT
    usdtAddress: String
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
