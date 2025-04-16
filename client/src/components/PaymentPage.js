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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <StoreIcon sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h4">
                Payment Summary
              </Typography>
            </Box>
            <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.2)' }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography color="rgba(255,255,255,0.7)" gutterBottom>
                  Merchant
                </Typography>
                <Typography variant="h6">
                  {paymentDetails?.merchantName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                <Typography color="rgba(255,255,255,0.7)" gutterBottom>
                  Amount to Pay
                </Typography>
                <Typography variant="h4">
                  {paymentDetails?.currency} {paymentDetails?.amount.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
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