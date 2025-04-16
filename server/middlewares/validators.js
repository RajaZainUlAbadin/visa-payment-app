// server/middleware/validators.js

const { body } = require('express-validator');

exports.validatePaymentLink = [
  body('merchantCard.cardNumber')
    .matches(/^(4957030420210454|4957030420210462|4895142232120006|4895142232120014)$/)
    .withMessage('Please use a valid test card number'),
  
  body('merchantCard.expiryDate')
    .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)
    .withMessage('Invalid expiry date format (MM/YY)')
    .custom((value) => {
      const [month, year] = value.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (expiry < new Date()) {
        throw new Error('Card has expired');
      }
      return true;
    }),
  
  body('merchantCard.cardholderName')
    .trim()
    .notEmpty()
    .withMessage('Cardholder name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  
  body('currency')
    .isIn(['USD'])
    .withMessage('Only USD is supported at this time')
];

exports.validatePayment = [
  body('paymentId')
    .notEmpty()
    .withMessage('Payment ID is required'),
    
  body('customerCard.cardNumber')
    .matches(/^(4957030420210454|4957030420210462|4895142232120006|4895142232120014)$/)
    .withMessage('Please use a valid test card number'),
    
  body('customerCard.expiryDate')
    .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)
    .withMessage('Invalid expiry date format (MM/YY)')
    .custom((value) => {
      const [month, year] = value.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (expiry < new Date()) {
        throw new Error('Card has expired');
      }
      return true;
    }),
    
  body('customerCard.cardholderName')
    .trim()
    .notEmpty()
    .withMessage('Cardholder name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
];