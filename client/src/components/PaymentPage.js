// client/src/components/PaymentPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import axios from 'axios';

const PaymentPage = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  const [customerCard, setCustomerCard] = useState({
    cardNumber: '',
    expiryDate: '',
    cardholderName: '',
    cvv: ''
  });

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/payments/${paymentId}`);
        setPaymentDetails(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching payment details:', error);
        setError('Failed to load payment details');
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerCard(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/payments/process', {
        paymentId,
        customerCard
      });

      if (response.data.success) {
        // Navigate to invoice page
        navigate(`/invoice/${paymentId}`);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payment Summary
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography color="text.secondary">Merchant</Typography>
              <Typography variant="body1">{paymentDetails?.merchantName}</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography color="text.secondary">Amount</Typography>
              <Typography variant="h6">
                {paymentDetails?.currency} {paymentDetails?.amount.toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CreditCardIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Payment Details
          </Typography>
        </Box>

        <form onSubmit={handlePayment}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Card Number"
                name="cardNumber"
                value={customerCard.cardNumber}
                onChange={handleInputChange}
                inputProps={{ maxLength: 16 }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                name="expiryDate"
                placeholder="MM/YY"
                value={customerCard.expiryDate}
                onChange={handleInputChange}
                inputProps={{ maxLength: 5 }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CVV"
                name="cvv"
                type="password"
                value={customerCard.cvv}
                onChange={handleInputChange}
                inputProps={{ maxLength: 4 }}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cardholder Name"
                name="cardholderName"
                value={customerCard.cardholderName}
                onChange={handleInputChange}
                required
              />
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={processing}
                startIcon={<LockIcon />}
              >
                {processing ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Processing...
                  </>
                ) : (
                  `Pay ${paymentDetails?.currency} ${paymentDetails?.amount.toFixed(2)}`
                )}
              </Button>
            </Grid>
          </Grid>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            <LockIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
            Your payment information is secure and encrypted
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default PaymentPage;