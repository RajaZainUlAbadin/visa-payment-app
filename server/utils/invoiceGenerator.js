// server/utils/invoiceGenerator.js

const generateInvoice = async (payment) => {
    return {
      invoiceNumber: `INV-${payment._id.toString().slice(-6)}`,
      date: payment.paidAt,
      merchantName: payment.merchantCard.cardholderName,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      transactionId: payment.transactionId,
      paymentMethod: 'Visa Direct',
      items: [{
        description: 'Payment Transfer',
        amount: payment.amount
      }],
      total: payment.amount
    };
  };
  
  module.exports = {
    generateInvoice
  };