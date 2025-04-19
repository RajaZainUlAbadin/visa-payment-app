// server/controllers/paymentController.js

const Payment = require('../models/Payment');
const visaService = require('../services/visaService');
const { generateInvoice } = require('../utils/invoiceGenerator');

const { validationResult } = require('express-validator');
const VisaDirectService = require('../services/visaDirectService');
const { v4: uuidv4 } = require('uuid');

exports.createPaymentLink = async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { merchantCard, amount, currency } = req.body;
  
      // Create new payment document
      const newPayment = new Payment({
        merchantCard,
        amount: parseFloat(amount),
        currency: currency || 'USD',
        status: 'PENDING',
        createdAt: new Date()
      });
  
      // Save first to get the _id
      await newPayment.save();
  
      // Now update with payment link
      newPayment.paymentLink = `${process.env.FRONTEND_URL}/pay/${newPayment._id}`;
      await newPayment.save();
  
      // Return success response
      res.status(201).json({
        success: true,
        paymentId: newPayment._id,
        paymentLink: newPayment.paymentLink
      });
  
    } catch (error) {
      console.error('Create payment link error:', error);
      res.status(500).json({ 
        error: 'Failed to create payment link',
        details: error.message 
      });
    }
};

exports.getPaymentDetails = async (req, res) => {
    try {
      const payment = await Payment.findById(req.params.paymentId);
      
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
  
      res.json({
        merchantName: payment.merchantCard.cardholderName,
        amount: payment.amount,
        currency: payment.currency || 'USD',
        status: payment.status,
        paymentId: payment._id
      });
    } catch (error) {
      console.error('Get payment details error:', error);
      res.status(500).json({ error: 'Failed to get payment details' });
    }
};

exports.processPayment = async (req, res) => {
  try {
    const { paymentId, customerCard } = req.body;

    // Find the payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    console.log('Processing payment:', {
      paymentId,
      amount: payment.amount,
      sourceCardLast4: customerCard.cardNumber.slice(-4),
      destCardLast4: payment.merchantCard.cardNumber.slice(-4)
    });

    // Process Visa Direct transfer
    const result = await VisaDirectService.pushFundsTransfer(
      customerCard,
      payment.merchantCard,
      payment.amount
    );

    if (result.success) {
      payment.status = 'COMPLETED';
      payment.transactionId = result.transactionId;
      payment.completedAt = new Date();
      await payment.save();

      res.json({
        success: true,
        status: 'COMPLETED',
        transactionId: result.transactionId
      });
    } else {
      payment.status = 'FAILED';
      payment.errorMessage = result.error;
      await payment.save();

      res.status(400).json({
        success: false,
        error: 'Payment processing failed',
        details: result.details
      });
    }

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Payment processing failed',
      details: error.message
    });
  }
};
  
exports.getInvoice = async (req, res) => {
    try {
      const payment = await Payment.findById(req.params.paymentId);
      
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
  
      if (payment.status !== 'COMPLETED') {
        return res.status(400).json({ error: 'Payment not completed' });
      }
  
      const invoice = {
        invoiceNumber: `INV-${payment._id.toString().slice(-6)}`,
        date: payment.paidAt,
        merchantName: payment.merchantCard.cardholderName,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        items: [{
          description: 'Payment Transfer',
          amount: payment.amount
        }],
        total: payment.amount
      };
  
      res.json(invoice);
    } catch (error) {
      console.error('Get invoice error:', error);
      res.status(500).json({ error: 'Failed to get invoice' });
    }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      status: payment.status,
      transactionId: payment.transactionId,
      paidAt: payment.paidAt
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
};

exports.listMerchantPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      'merchantCard.cardholderName': req.user.name
    }).sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error('List payments error:', error);
    res.status(500).json({ error: 'Failed to list payments' });
  }
};