// server/controllers/paymentController.js

const Payment = require('../models/Payment');
const visaService = require('../services/visaService');
const { generateInvoice } = require('../utils/invoiceGenerator');

exports.createPaymentLink = async (req, res) => {
  try {
    const { merchantCard, amount, currency } = req.body;
    
    const payment = new Payment({
      merchantCard,
      amount,
      currency,
      status: 'PENDING',
      createdAt: new Date(),
      paymentLink: `${process.env.FRONTEND_URL}/pay/${payment._id}`
    });

    await payment.save();

    res.json({
      success: true,
      paymentId: payment._id,
      paymentLink: payment.paymentLink
    });
  } catch (error) {
    console.error('Create payment link error:', error);
    res.status(500).json({ error: 'Failed to create payment link' });
  }
};

exports.getPaymentDetails = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      merchantName: payment.merchantCard.cardholderName
    });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({ error: 'Failed to get payment details' });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const { paymentId, customerCard } = req.body;
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const result = await visaService.pushFundsTransfer(
      customerCard,
      payment.merchantCard,
      payment.amount
    );

    if (result.success) {
      payment.status = 'COMPLETED';
      payment.transactionId = result.transactionId;
      payment.paidAt = new Date();
      await payment.save();

      const invoice = await generateInvoice(payment);

      res.json({
        success: true,
        transactionId: result.transactionId,
        invoice
      });
    } else {
      res.status(400).json({ error: 'Payment failed', details: result.error });
    }
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
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

    const invoice = await generateInvoice(payment);
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