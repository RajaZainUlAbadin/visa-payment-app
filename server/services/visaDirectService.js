// server/services/visaDirectService.js

const axios = require('axios');
const fs = require('fs');
const https = require('https');

class VisaDirectService {
  constructor() {
    this.userId = process.env.VISA_USER_ID;
    this.password = process.env.VISA_PASSWORD;
    this.keyId = process.env.VISA_Key_Id;
    this.cert = fs.readFileSync(process.env.VISA_CERT, 'utf8');
    this.privateKey = fs.readFileSync(process.env.VISA_PRIVATE_KEY, 'utf8');
    this.baseURL = process.env.VISA_API_URL;
    this.acquiringBIN = process.env.VISA_ACQUIRING_BIN || '408999';
  }

  async pushFundsTransfer(sourceCard, destinationCard, amount) {
    try {
      const currentDate = new Date();
      const retrievalReferenceNumber = `${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`;
      
      const requestData = {
        "acquirerCountryCode": "840",
        "acquiringBin": this.acquiringBIN,
        "amount": amount,
        "businessApplicationId": "AA",
        "cardAcceptor": {
          "address": {
            "country": "USA",
            "county": "San Mateo",
            "state": "CA",
            "zipCode": "94404"
          },
          "idCode": "CA-IDCode-77765",
          "name": "Visa Inc. USA-Foster City",
          "terminalId": "TID-9999"
        },
        "localTransactionDateTime": currentDate.toISOString(),
        "merchantCategoryCode": "6012",
        "pointOfServiceData": {
          "panEntryMode": "90",
          "posConditionCode": "00",
          "motoECIIndicator": "0"
        },
        "recipientName": destinationCard.cardholderName,
        "recipientPrimaryAccountNumber": destinationCard.cardNumber,
        "retrievalReferenceNumber": retrievalReferenceNumber,
        "senderAccountNumber": sourceCard.cardNumber,
        "senderAddress": "901 Metro Center Blvd",
        "senderCity": "Foster City",
        "senderCountryCode": "124",
        "senderName": sourceCard.cardholderName,
        "senderReference": "",
        "senderStateCode": "CA",
        "sourceOfFundsCode": "05",
        "systemsTraceAuditNumber": retrievalReferenceNumber.slice(-6),
        "transactionCurrencyCode": "USD",
        "transactionIdentifier": `${Date.now()}`,
        "settlementServiceIndicator": "9"
      };

      // Create authentication headers
      const auth = Buffer.from(`${this.userId}:${this.password}`).toString('base64');
      const resourcePath = 'visadirect/fundstransfer/v1/pushfundstransactions';
      const queryString = '';
      const timestamp = new Date().toISOString();
      
      const response = await axios({
        method: 'post',
        url: `${this.baseURL}/${resourcePath}`,
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'x-pay-token': this.keyId,
          'x-correlation-id': `${Date.now()}`,
          'x-client-transaction-id': `${Date.now()}`,
          'x-visa-api-key': this.keyId
        },
        data: requestData,
        httpsAgent: new https.Agent({
          cert: this.cert,
          key: this.privateKey,
          rejectUnauthorized: false // Only for sandbox
        })
      });

      console.log('Visa API Response:', response.data);

      return {
        success: true,
        transactionId: response.data.transactionIdentifier,
        actionCode: response.data.actionCode,
        responseData: response.data
      };

    } catch (error) {
      console.error('Visa Direct API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers
      });

      return {
        success: false,
        error: error.message,
        details: error.response?.data || error.message
      };
    }
  }
}

module.exports = new VisaDirectService();