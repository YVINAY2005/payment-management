import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    paymentType: {
        type: String,
        enum: ['Bank', 'Paytm', 'UPI', 'PayPal', 'USDT', 'GPay', 'PhonePe', 'OPay', 'PalmPay'],
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
    usdtAddress: String,
    // GPay
    gpayNumber: String,
    // PhonePe
    phonePeNumber: String,
    // OPay
    opayNumber: String,
    // PalmPay
    palmpayNumber: String
}, { timestamps: true });

export default mongoose.model('Payment', PaymentSchema);
