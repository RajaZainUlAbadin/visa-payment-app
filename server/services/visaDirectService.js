// server/services/visaDirectService.js

const axios = require('axios');
const fs = require('fs');
const https = require('https');
const path = require('path');

class VisaDirectService {
  constructor() {
    this.keyId = process.env.VISA_Key_Id;
    // Read certificates properly
    this.cert = fs.readFileSync(process.env.VISA_CERT, 'utf8');
    this.privateKey = fs.readFileSync(process.env.VISA_PRIVATE_KEY, 'utf8');
    this.baseURL = process.env.VISA_API_URL;
    this.acquiringBIN = process.env.VISA_ACQUIRING_BIN || '408999';
  }

  async pushFundsTransfer(sourceCard, destinationCard, amount) {
    try {
      const timestamp = new Date().toISOString();
      
      const requestData = {
        systemsTraceAuditNumber: Math.floor(Math.random() * 1000000).toString(),
        retrievalReferenceNumber: `${Date.now()}${Math.floor(Math.random() * 1000)}`,
        localTransactionDateTime: timestamp,
        acquiringBin: this.acquiringBIN,
        acquirerCountryCode: "840", // USA
        senderCurrencyCode: "USD",
        senderPrimaryAccountNumber: sourceCard.cardNumber,
        amount: amount,
        businessApplicationId: "PP", // Push Payment
        transactionCurrencyCode: "USD",
        recipientPrimaryAccountNumber: destinationCard.cardNumber,
        cardAcceptor: {
          name: "Visa Direct Transfer",
          terminalId: "12345678",
          idCode: "VDIRECT",
          address: {
            state: "CA",
            country: "USA",
            zipCode: "94404"
          }
        }
      };

      // Create HTTPS agent with certificates
      const httpsAgent = new https.Agent({
        cert: this.cert,
        key: this.privateKey,
        rejectUnauthorized: false // Only for testing! Remove in production
      });

      const response = await axios({
        method: 'post',
        url: `${this.baseURL}/visadirect/fundstransfer/v1/pushfundstransactions`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${Buffer.from(this.keyId + ':').toString('base64')}`,
          'x-correlation-id': `${Date.now()}`
        },
        data: requestData,
        httpsAgent: httpsAgent
      });

      return {
        success: true,
        transactionId: response.data.transactionIdentifier,
        actionCode: response.data.actionCode,
        responseData: response.data
      };

    } catch (error) {
      console.error('Visa Direct API Error:', error);
      return {
        success: false,
        error: error.message,
        details: error.response?.data || error.message
      };
    }
  }
}

module.exports = new VisaDirectService();