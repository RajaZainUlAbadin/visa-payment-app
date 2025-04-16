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
  IconButton
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import axios from 'axios';

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    merchantCard: {
      cardNumber: '',
      expiryDate: '',
      cardholderName: ''
    },
    amount: '',
    currency: 'USD'
  });

  const [errors, setErrors] = useState({});

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const response = await axios.post('http://localhost:5000/api/payments/create-link', formData);
      console.log('Payment link created:', response.data);
      // Handle success
    } catch (error) {
      console.error('Error:', error.response?.data);
      if (error.response?.data?.errors) {
        const newErrors = {};
        error.response.data.errors.forEach(err => {
          newErrors[err.path] = err.msg;
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Payment Details
          <Tooltip title={
            <div>
              <Typography variant="caption">Test Card Numbers:</Typography>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                <li>4957030420210454</li>
                <li>4957030420210462</li>
                <li>4895142232120006</li>
              </ul>
              <Typography variant="caption">Use any future date for expiry (MM/YY)</Typography>
            </div>
          }>
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Typography>
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
            >
              Generate Payment Link
            </Button>
          </Grid>
        </Grid>
      </form>

      <Box sx={{ mt: 3 }}>
        <Alert severity="info">
          For testing, use any of the test card numbers shown above.
          Use any future date for expiry date (format: MM/YY).
        </Alert>
      </Box>
    </Paper>
  );
};

export default PaymentForm;