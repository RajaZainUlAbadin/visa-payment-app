// server/models/Payment.js

const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  cardNumber: {
    type: String,
    required: true
  },
  expiryDate: {
    type: String,
    required: true
  },
  cardholderName: {
    type: String,
    required: true
  }
});

const paymentSchema = new mongoose.Schema({
  merchantCard: cardSchema,
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
    default: 'PENDING'
  },
  paymentLink: String,
  transactionId: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

module.exports = mongoose.model('Payment', paymentSchema);