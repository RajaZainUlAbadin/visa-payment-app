// server/services/visaDirectService.js

const axios = require('axios');
const fs = require('fs');
const https = require('https');

class VisaDirectService {
    constructor() {
        this.userId = process.env.VISA_USER_ID;
        this.password = process.env.VISA_PASSWORD;
        this.apiKey = process.env.VISA_KEY_ID;
        
        // Load certificates with passphrase
        try {
            this.cert = fs.readFileSync(process.env.VISA_CERT);
            this.privateKey = fs.readFileSync(process.env.VISA_PRIVATE_KEY);
        } catch (error) {
            console.error('Certificate loading error:', error);
            throw new Error('Failed to load certificates');
        }

        this.baseURL = process.env.VISA_API_URL;
        this.acquiringBIN = process.env.VISA_ACQUIRING_BIN;
    }

    async pushFundsTransfer(sourceCard, destinationCard, amount) {
        try {
            const correlationId = Date.now().toString();
            const basicAuth = Buffer.from(`${this.userId}:${this.password}`).toString('base64');

            // Create HTTPS agent with passphrase
            const httpsAgent = new https.Agent({
                cert: this.cert,
                key: this.privateKey,
                passphrase: 'test',  // Added the passphrase here
                rejectUnauthorized: false
            });

            const response = await axios({
                method: 'post',
                url: `${this.baseURL}/visadirect/fundstransfer/v1/pushfundstransactions`,
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Basic ${basicAuth}`,
                  'x-api-key': this.apiKey,
                  'x-correlation-id': correlationId
                },
                data: {
                  systemsTraceAuditNumber: correlationId.slice(-6),
                  retrievalReferenceNumber: correlationId.slice(0, 12),
                  localTransactionDateTime: new Date().toISOString(),
                  acquiringBin: this.acquiringBIN,
                  acquirerCountryCode: "840",
                  senderCurrencyCode: "USD",
                  senderPrimaryAccountNumber: sourceCard.cardNumber,
                  amount: amount,
                  businessApplicationId: "AA",
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
                },
                httpsAgent: new https.Agent({
                  cert: this.cert,
                  key: this.privateKey,
                  passphrase: 'test', // remove if not needed
                  rejectUnauthorized: false
                })
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

module.exports = VisaDirectService;