// client/src/components/PaymentForm.js

import React, { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  Box,
  Alert,
  Tooltip,
  IconButton,
  Card,
  CardContent,
  Snackbar,
  InputAdornment,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Info as InfoIcon,
  ContentCopy as ContentCopyIcon,
  CreditCard as CreditCardIcon,
  Link as LinkIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import axios from 'axios';

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    merchantCard: {
      cardNumber: '4098872852544805',
      expiryDate: '',
      cardholderName: ''
    },
    amount: '',
    currency: 'USD'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [paymentLink, setPaymentLink] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('merchantCard.')) {
      const cardField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        merchantCard: {
          ...prev.merchantCard,
          [cardField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink.paymentLink);
    setSnackbar({ open: true, message: 'Payment link copied to clipboard!' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const response = await axios.post('https://161.35.38.181.nip.io:5000/api/payments/create-link', formData);
      setPaymentLink(response.data);
      setSnackbar({ open: true, message: 'Payment link generated successfully!' });
    } catch (error) {
      console.error('Error:', error.response?.data);
      if (error.response?.data?.errors) {
        const newErrors = {};
        error.response.data.errors.forEach(err => {
          newErrors[err.path] = err.msg;
        });
        setErrors(newErrors);
      }
      setSnackbar({ open: true, message: 'Failed to generate payment link' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          borderRadius: 2,
          background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)'
        }}
      >
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
          <CreditCardIcon sx={{ mr: 2, color: 'primary.main', fontSize: 30 }} />
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
            Generate Payment Link
          </Typography>
          <Tooltip title={
            <Box>
              <Typography variant="subtitle2">Test Card Numbers:</Typography>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>4957030420210454</li>
                <li>4957030420210462</li>
                <li>4895142232120006</li>
              </ul>
              <Typography variant="caption">
                Use any future date for expiry (MM/YY)
              </Typography>
            </Box>
          }>
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Card Number"
                name="merchantCard.cardNumber"
                value={formData.merchantCard.cardNumber}
                onChange={handleChange}
                error={!!errors['merchantCard.cardNumber']}
                helperText={errors['merchantCard.cardNumber']}
                inputProps={{ maxLength: 16 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CreditCardIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                name="merchantCard.expiryDate"
                placeholder="MM/YY"
                value={formData.merchantCard.expiryDate}
                onChange={handleChange}
                error={!!errors['merchantCard.expiryDate']}
                helperText={errors['merchantCard.expiryDate']}
                inputProps={{ maxLength: 5 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cardholder Name"
                name="merchantCard.cardholderName"
                value={formData.merchantCard.cardholderName}
                onChange={handleChange}
                error={!!errors['merchantCard.cardholderName']}
                helperText={errors['merchantCard.cardholderName']}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                error={!!errors.amount}
                helperText={errors.amount}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  mt: 2,
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Generate Payment Link'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>

        {paymentLink && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ my: 3 }} />
            <Card 
              variant="outlined" 
              sx={{ 
                bgcolor: 'success.light',
                borderRadius: 2
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircleIcon sx={{ color: 'white', mr: 1 }} />
                  <Typography variant="h6" color="white">
                    Payment Link Generated
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: 'background.paper',
                    p: 2,
                    borderRadius: 1
                  }}
                >
                  <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography 
                    sx={{ 
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {paymentLink.paymentLink}
                  </Typography>
                  <Button
                    startIcon={<ContentCopyIcon />}
                    onClick={handleCopyLink}
                    variant="contained"
                    size="small"
                    sx={{ ml: 2 }}
                  >
                    Copy
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        <Box sx={{ mt: 3 }}>
          <Alert 
            severity="info"
            sx={{ 
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }}
          >
            For testing, use any of the test card numbers shown above.
            Use any future date for expiry date (format: MM/YY).
          </Alert>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default PaymentForm;