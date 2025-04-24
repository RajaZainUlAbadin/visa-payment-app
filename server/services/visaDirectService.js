// server/services/visaDirectService.js

const axios = require('axios');
const fs = require('fs');
const https = require('https');

class VisaDirectService {
    constructor() {
        this.userId =  process.env.VISA_USER_ID
        this.password = process.env.VISA_PASSWORD
        
        // Load certificates with passphrase
        try {
            this.httpsAgent = new https.Agent({
                cert: fs.readFileSync(process.env.VISA_CERT),
                key: fs.readFileSync(process.env.VISA_PRIVATE_KEY),
                ca: fs.readFileSync(process.env.VISA_CA),
                rejectUnauthorized: false,
            });
            
        } catch (error) {
            console.error('Certificate loading error:', error);
            throw new Error('Failed to load certificates');
        }

        this.baseURL = process.env.VISA_API_URL;
        this.acquiringBIN = process.env.VISA_ACQUIRING_BIN || "408999";
    }

    async pushFundsTransfer(sourceCard, destinationCard, amount) {
        try {
            const correlationId = Date.now().toString();
            const basicAuth = Buffer.from(`${this.userId}:${this.password}`).toString('base64');
            
            // Generate unique numbers for transaction
            const systemsTraceAuditNumber = correlationId.slice(-6);
            const retrievalReferenceNumber = `${systemsTraceAuditNumber}${new Date().getDate().toString().padStart(2, '0')}`;
            
            const payload = {
                "acquiringBin": this.acquiringBIN,
                "acquirerCountryCode": 840,
                "businessApplicationId": "FT",
                "localTransactionDateTime": new Date().toISOString().split('.')[0],
                "merchantCategoryCode": 6012,
                "request": [
                    {
                        "amount": parseFloat(amount).toFixed(2), // Ensure amount is formatted correctly
                        "cardAcceptor": {
                            "name": sourceCard.cardholderName || "Merchant Name",
                            "terminalId": systemsTraceAuditNumber, // Use dynamic terminal ID
                            "idCode": retrievalReferenceNumber.slice(0, 4),
                            "address": {
                                "city": sourceCard.city || "San Francisco",
                                "state": sourceCard.state || "CA",
                                "county": "00",
                                "country": "840", // ISO country code for USA
                                "zipCode": sourceCard.zipCode || "94404"
                            }
                        },
                        "feeProgramIndicator": "123",
                        "localTransactionDateTime": new Date().toISOString().split('.')[0],
                        "recipientName": destinationCard.cardholderName,
                        "recipientPrimaryAccountNumber": destinationCard.cardNumber.replace(/\s/g, ''), // Remove spaces
                        "retrievalReferenceNumber": retrievalReferenceNumber,
                        "senderAddress": sourceCard.address || "123 Main Street",
                        "senderCity": sourceCard.city || "San Francisco",
                        "senderCountryCode": "USA",
                        "senderName": sourceCard.cardholderName,
                        "senderStateCode": sourceCard.state || "CA",
                        "sourceOfFundsCode": "01",
                        "systemsTraceAuditNumber": parseInt(systemsTraceAuditNumber),
                        "transactionCurrencyCode": "USD",
                        "transactionIdentifier": parseInt(correlationId.slice(-12)),
                        "settlementServiceIndicator": 9
                    }
                ]
            };

            console.log('Sending payment request with payload:', JSON.stringify(payload, null, 2))

            const response = await axios({
                method: 'post',
                url: `${this.baseURL}/visadirect/fundstransfer/v1/multipushfundstransactions`,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Basic ${basicAuth}`,
                    'x-client-transaction-id': `txn-${correlationId}`
                },
                data: payload,
                httpsAgent: this.httpsAgent
            });

            // Get the transaction identifier from the initial response
            let transactionId;
            if (typeof response.data === "string") {
                // If response is string, it's the transaction ID
                transactionId = response.data;
            } else {
                // If response is JSON, get transactionIdentifier
                transactionId = response.data.transactionIdentifier;
            }

            const statusResult = await this.fetchTransactionStatusWithRetry(transactionId);
            
            if (statusResult.success && statusResult.transactionStatus) {
                // We got a proper JSON response
                return {
                    success: true,
                    transactionId: transactionId,
                    responseData: statusResult.transactionStatus
                };
            }

            throw new Error('Failed to get proper transaction status after maximum retries');


        } catch (error) {
            console.error('Visa Direct API Error:', error);
            return {
                success: false,
                error: error.message,
                details: error.response?.data || error.message
            };
        }
    }

    async checkTransactionStatus(statusIdentifier) {
        try {
            const basicAuth = Buffer.from(`${this.userId}:${this.password}`).toString('base64');

            const response = await axios({
                method: 'get',
                url: `${this.baseURL}/visadirect/fundstransfer/v1/multipushfundstransactions/${statusIdentifier}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Basic ${basicAuth}`,
                    'x-client-transaction-id': `query-${Date.now()}`
                },
                httpsAgent: this.httpsAgent
            });

            return {
                success: true,
                transactionStatus: response.data
            };

        } catch (error) {
            console.error('Transaction status check error:', error);
            return {
                success: false,
                error: error.message,
                details: error.response?.data || error.message
            };
        }
    }

    async fetchTransactionStatusWithRetry(statusIdentifier, retries = 20, delay = 3000) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            const result = await this.checkTransactionStatus(statusIdentifier);
            
            if (result.success) {
                const transactionStatus = result.transactionStatus;
                
                if (typeof transactionStatus === "string") {
                    console.warn(`Attempt ${attempt}: got string response, retrying...`);
                    console.log("The data is still ",transactionStatus)
                    if (attempt < retries) await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                return {
                    success: true,
                    transactionStatus: {
                        acquiringBin: transactionStatus.acquiringBin,
                        acquirerCountryCode: transactionStatus.acquirerCountryCode,
                        businessApplicationId: transactionStatus.businessApplicationId,
                        merchantCategoryCode: transactionStatus.merchantCategoryCode,
                        localTransactionDateTime: transactionStatus.localTransactionDateTime,
                        systemsTraceAuditNumber: transactionStatus.response?.[0]?.systemsTraceAuditNumber,
                        octResponseDetail: transactionStatus.response?.[0]?.octResponseDetail,
                    },
                };
            }

            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        return { success: false, message: "Transaction status unavailable after retries." };
    }
}

module.exports = VisaDirectService;