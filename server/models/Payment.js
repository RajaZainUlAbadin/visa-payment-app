const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  merchantCard: {
    cardNumber: String,
    expiryDate: String,
    cardholderName: String
  },
  amount: Number,
  currency: String,
  paymentLink: String,
  status: String,
  createdAt: Date,
  paidAt: Date
});

module.exports = mongoose.model('Payment', paymentSchema);