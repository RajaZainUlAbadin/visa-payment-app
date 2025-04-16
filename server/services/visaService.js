// server/services/visaService.js

const axios = require('axios');
const crypto = require('crypto');

class VisaAPIService {
  constructor() {
    this.userId = process.env.VISA_USER_ID;
    this.password = process.env.VISA_PASSWORD;
    this.cert = process.env.VISA_CERT;
    this.key = process.env.VISA_PRIVATE_KEY;
    this.baseURL = process.env.VISA_API_URL;
  }

  async pushFundsTransfer(sourceCard, destinationCard, amount) {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const requestData = {
        systemsTraceAuditNumber: Math.floor(Math.random() * 1000000).toString(),
        retrievalReferenceNumber: `${timestamp}${Math.floor(Math.random() * 1000)}`,
        localTransactionDateTime: new Date().toISOString(),
        acquiringBin: process.env.VISA_ACQUIRING_BIN,
        acquirerCountryCode: "840",
        senderAccountNumber: sourceCard.cardNumber,
        senderCurrencyCode: "USD",
        amount: amount,
        businessApplicationId: "PP",
        merchantCategoryCode: "6012",
        recipientName: destinationCard.cardholderName,
        recipientPrimaryAccountNumber: destinationCard.cardNumber,
        transactionCurrencyCode: "USD",
        sourceOfFundsCode: "05",
        cardAcceptor: {
          name: "Push Pay",
          terminalId: "12345678",
          idCode: "ABCD1234ABCD123",
          address: {
            state: "CA",
            county: "081",
            country: "USA",
            zipCode: "94404"
          }
        }
      };

      const response = await axios({
        method: 'post',
        url: `${this.baseURL}/visadirect/fundstransfer/v1/pushfundstransactions`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.generateAuthHeader(),
          'x-correlation-id': `${timestamp}${Math.floor(Math.random() * 1000)}`
        },
        data: requestData,
        cert: this.cert,
        key: this.key
      });

      return {
        success: true,
        transactionId: response.data.transactionIdentifier,
        actionCode: response.data.actionCode
      };

    } catch (error) {
      console.error('Visa API Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateAuthHeader() {
    const credentials = Buffer.from(`${this.userId}:${this.password}`).toString('base64');
    return `Basic ${credentials}`;
  }
}

module.exports = new VisaAPIService();