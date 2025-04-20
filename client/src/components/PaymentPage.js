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
  CardContent,
  InputAdornment,
  Fade,
  Chip,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  AccessTime as TimeIcon,
  Store as StoreIcon,
  Payment as PaymentIcon,
  Shield as ShieldIcon
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
        const response = await axios.get(`https://161.35.38.181.nip.io:5000/api/payments/${paymentId}`);
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

      const paymentData = {
        paymentId: paymentId, // Make sure this is a string
        customerCard: {
          cardNumber: customerCard.cardNumber.replace(/\s/g, ''),
          expiryDate: customerCard.expiryDate,
          cardholderName: customerCard.cardholderName,
          cvv: customerCard.cvv
        }
      };

      console.log('Sending payment data:', paymentData); // For debugging

      const response = await axios.post(
        'https://161.35.38.181.nip.io:5000/api/payments/process',
        paymentData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
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
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="60vh"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Payment Details...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert 
          severity="error" 
          variant="filled"
          sx={{ 
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        maxWidth: 800, 
        mx: 'auto', 
        p: 3,
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #f5f7fa 0%, #e4e9f2 100%)'
      }}
    >
      <Fade in={true}>
        <Card 
          elevation={4}
          sx={{ 
            mb: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #00b4db 0%, #0083b0 100%)',
            color: 'white'
          }}
        >
      <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                mb: 4
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <StoreIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                    <Typography variant="h4" gutterBottom>
                    Payment Summary
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Transaction #{paymentId?.slice(-8).toUpperCase()}
                    </Typography>
                </Box>
                </Box>
                <Box sx={{ 
                bgcolor: 'rgba(255,255,255,0.1)', 
                px: 2, 
                py: 1, 
                borderRadius: 2
                }}>
                <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Date
                </Typography>
                <Typography variant="body1">
                    {new Date().toLocaleDateString()}
                </Typography>
                </Box>
            </Box>

            {/* Amount and Merchant Details */}
            <Box sx={{ 
    bgcolor: 'rgba(255,255,255,0.1)', 
    borderRadius: 3,
    p: 3,
    mb: 3
}}>
    <Grid container spacing={3} alignItems="center" justifyContent="space-between">
        {/* Merchant Details - Left Side */}
        <Grid item xs={6}>
            <Typography color="rgba(255,255,255,0.7)" gutterBottom>
                Paying to
            </Typography>
            <Typography variant="h6" sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1
            }}>
                <StoreIcon sx={{ fontSize: 24 }} />
                {paymentDetails?.merchantName}
            </Typography>
        </Grid>

        {/* Amount Details - Right Side */}
        <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Box>
                <Typography 
                    color="rgba(255,255,255,0.7)" 
                    gutterBottom 
                    sx={{ textAlign: 'right' }}
                >
                    Amount to Pay
                </Typography>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'flex-end'
                }}>
                    <Typography 
                        component="span"
                        variant="h6" 
                        sx={{ 
                            color: 'rgba(255,255,255,0.7)',
                            mr: 1
                        }}
                    >
                        {paymentDetails?.currency}
                    </Typography>
                    <Typography 
                        component="span"
                        variant="h5" 
                        sx={{ 
                            fontWeight: 'bold'
                        }}
                    >
                        {paymentDetails?.amount?.toFixed(2) || '0.00'}
                    </Typography>
                </Box>
            </Box>
        </Grid>
    </Grid>
</Box>
            {/* Payment Status */}
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 2,
                p: 2
            }}>
                <Box sx={{ 
                width: 10, 
                height: 10, 
                borderRadius: '50%', 
                bgcolor: 'success.main',
                animation: 'pulse 2s infinite'
                }} />
                <Typography variant="body2" color="rgba(255,255,255,0.9)">
                Secure Payment Gateway
                </Typography>
            </Box>

            <style>
                {`
                @keyframes pulse {
                    0% { opacity: 0.5; }
                    50% { opacity: 1; }
                    100% { opacity: 0.5; }
                }
                `}
            </style>
            </CardContent>
        </Card>
      </Fade>

      <Paper 
        elevation={4}
        sx={{ 
          p: 4,
          borderRadius: 3,
          background: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <PaymentIcon sx={{ fontSize: 30, mr: 2, color: 'primary.main' }} />
          <Typography variant="h5">
            Enter Payment Details
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CreditCardIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert 
                  severity="error" 
                  variant="filled"
                  sx={{ borderRadius: 2 }}
                >
                  {error}
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={processing}
                startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
                sx={{
                  py: 2,
                  mt: 2,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #00B4DB 90%)',
                  }
                }}
              >
                {processing ? 'Processing...' : `Pay ${paymentDetails?.currency} ${paymentDetails?.amount.toFixed(2)}`}
              </Button>
            </Grid>
          </Grid>
        </form>

        <Box sx={{ mt: 4, mb: 2 }}>
          <Divider>
            <Chip 
              icon={<SecurityIcon />} 
              label="Secure Payment" 
              color="primary" 
              variant="outlined" 
            />
          </Divider>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 3, 
          mt: 3 
        }}>
          <Tooltip title="SSL Encrypted">
            <Box sx={{ textAlign: 'center' }}>
              <ShieldIcon color="success" sx={{ fontSize: 30 }} />
              <Typography variant="caption" display="block">
                SSL Secure
              </Typography>
            </Box>
          </Tooltip>
          <Tooltip title="PCI Compliant">
            <Box sx={{ textAlign: 'center' }}>
              <SecurityIcon color="success" sx={{ fontSize: 30 }} />
              <Typography variant="caption" display="block">
                PCI DSS
              </Typography>
            </Box>
          </Tooltip>
          <Tooltip title="Fast Processing">
            <Box sx={{ textAlign: 'center' }}>
              <TimeIcon color="success" sx={{ fontSize: 30 }} />
              <Typography variant="caption" display="block">
                Quick & Safe
              </Typography>
            </Box>
          </Tooltip>
        </Box>
      </Paper>

      {processing && (
        <LinearProgress 
          sx={{ 
            mt: 2, 
            borderRadius: 1,
            height: 8
          }} 
        />
      )}
    </Box>
  );
};

export default PaymentPage;