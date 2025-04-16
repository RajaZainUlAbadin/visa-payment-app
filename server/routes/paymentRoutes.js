// server/routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController.js');
const { validatePaymentLink, validatePayment } = require('../middlewares/validators.js');
const auth = require('../middlewares/auth.js');

// Create payment link (for business owners)
router.post('/create-link', validatePaymentLink, paymentController.createPaymentLink);

// Get payment details by ID
router.get('/:paymentId', paymentController.getPaymentDetails);

// Process payment (for customers)
router.post('/process', validatePayment, paymentController.processPayment);

// Get invoice
router.get('/invoice/:paymentId', paymentController.getInvoice);

// Get payment status
router.get(
  '/status/:paymentId',
  paymentController.getPaymentStatus
);

// List payments (for business owners)
router.get(
  '/merchant/payments',
  paymentController.listMerchantPayments
);

module.exports = router;