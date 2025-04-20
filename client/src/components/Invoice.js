// client/src/components/Invoice.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import {
  Paper,
  Typography,
  Grid,
  Button,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import { 
  Print as PrintIcon,
  Download as DownloadIcon 
} from '@mui/icons-material';
import axios from 'axios';
import { Stack } from '@mui/material';

const Invoice = () => {
  const { paymentId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axios.get(`https://161.35.38.181.nip.io/api/payments/invoice/${paymentId}`);
        setInvoice(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching invoice:', error);
        setError('Failed to load invoice');
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [paymentId]);

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    
    // Add content to PDF
    doc.text(`Invoice #${invoice.invoiceNumber}`, 20, 20);
    doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 20, 30);
    // Add more content...
    
    // Save the PDF
    doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>No invoice found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Paper 
        elevation={3}
        sx={{ 
          p: { xs: 2, md: 5 },
          borderRadius: 3,
          background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)'
        }} 
        className="invoice-container"
      >
        {/* Header */}
        <Box sx={{ mb: 5 }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box 
                  sx={{ 
                    bgcolor: 'primary.main',
                    color: 'white',
                    p: 2,
                    borderRadius: 2,
                    display: 'inline-block'
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    INV
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Invoice
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    #{invoice.invoiceNumber}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ mt: { xs: 2, md: 0 }, textAlign: 'right' }}>
              <Box className="no-print" sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-end' } }}>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    borderWidth: 2,
                    '&:hover': { borderWidth: 2 }
                  }}
                >
                  Print
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    boxShadow: 2
                  }}
                >
                  Download PDF
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Merchant and Payment Details */}
        <Box 
            sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                mb: 5,
                gap: 4  // This creates spacing between the boxes
            }}
            >
            {/* Left Side - Merchant Details */}
            <Box 
                sx={{ 
                bgcolor: 'grey.50',
                p: 3,
                borderRadius: 2,
                flex: 1  // Takes up equal space
                }}
            >
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                From
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', mb: 1 }}>
                {invoice.merchantName}
                </Typography>
                <Typography color="text.secondary">
                Merchant ID: {invoice.merchantId}
                </Typography>
            </Box>

            {/* Right Side - Payment Details */}
            <Box 
                sx={{ 
                bgcolor: 'grey.50',
                p: 3,
                borderRadius: 2,
                flex: 1,  // Takes up equal space
                textAlign: 'right'  // Aligns all text to the right
                }}
            >
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                Payment Details
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', mb: 1 }}>
                Date: {format(new Date(invoice.date), 'PPP')}
                </Typography>
                <Typography color="text.secondary">
                Transaction ID: {invoice.transactionId}
                </Typography>
            </Box>
        </Box>

        
        {/* Payment Summary */}
        <TableContainer 
          sx={{ 
            mb: 5,
            borderRadius: 2,
            boxShadow: '0 0 20px rgba(0,0,0,0.05)',
            overflow: 'hidden'
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  Description
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  Amount
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(item.amount, invoice.currency)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2} sx={{ border: 'none' }} />
              </TableRow>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  Total
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {formatCurrency(invoice.total, invoice.currency)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Payment Status */}
        <Box sx={{ 
          bgcolor: invoice.status === 'COMPLETED' ? 'success.light' : 'warning.light',
          p: 3,
          borderRadius: 2,
          mb: 5,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Box sx={{ 
            width: 12, 
            height: 12, 
            borderRadius: '50%',
            bgcolor: invoice.status === 'COMPLETED' ? 'white' : 'warning.main',
            animation: 'pulse 2s infinite'
          }} />
          <Typography variant="h6" sx={{ color: invoice.status === 'COMPLETED' ? 'white' : 'warning.dark' }}>
            Payment Status: {invoice.status}
          </Typography>
        </Box>

        {/* Footer */}
        <Divider sx={{ my: 4 }} />
        <Box sx={{ 
          textAlign: 'center',
          bgcolor: 'grey.50',
          p: 3,
          borderRadius: 2
        }}>
          <Typography variant="body2" color="text.secondary">
            This is a computer-generated invoice. No signature is required.
          </Typography>
        </Box>

        {/* Add pulse animation */}
        <style>
          {`
            @keyframes pulse {
              0% { opacity: 0.6; }
              50% { opacity: 1; }
              100% { opacity: 0.6; }
            }
          `}
        </style>
      </Paper>
    </Box>
  );
};

export default Invoice;