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

const Invoice = () => {
  const { paymentId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/payments/invoice/${paymentId}`);
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
    <Paper sx={{ p: 4, mb: 4 }} className="invoice-container">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h4" gutterBottom>
              INVOICE
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              #{invoice.invoiceNumber}
            </Typography>
          </Grid>
          <Grid item>
            <Box className="no-print" sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
              >
                Print
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
              >
                Download
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Merchant and Payment Details */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6}>
          <Typography variant="h6" gutterBottom>
            From
          </Typography>
          <Typography>{invoice.merchantName}</Typography>
          <Typography color="text.secondary">Merchant ID: {invoice.merchantId}</Typography>
        </Grid>
        <Grid item xs={6} sx={{ textAlign: 'right' }}>
          <Typography variant="h6" gutterBottom>
            Payment Details
          </Typography>
          <Typography>Date: {format(new Date(invoice.date), 'PPP')}</Typography>
          <Typography>Transaction ID: {invoice.transactionId}</Typography>
        </Grid>
      </Grid>

      {/* Payment Summary */}
      <TableContainer sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoice.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.description}</TableCell>
                <TableCell align="right">
                  {invoice.currency} {item.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell sx={{ border: 'none' }} />
              <TableCell sx={{ border: 'none' }} />
            </TableRow>
            <TableRow>
              <TableCell><strong>Total</strong></TableCell>
              <TableCell align="right">
                <strong>{invoice.currency} {invoice.total.toFixed(2)}</strong>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Payment Status */}
      <Box sx={{ 
        bgcolor: invoice.status === 'COMPLETED' ? 'success.light' : 'warning.light',
        p: 2,
        borderRadius: 1,
        mb: 4
      }}>
        <Typography variant="h6">
          Payment Status: {invoice.status}
        </Typography>
      </Box>

      {/* Footer */}
      <Divider sx={{ my: 3 }} />
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          This is a computer-generated invoice. No signature is required.
        </Typography>
      </Box>
    </Paper>
  );
};

export default Invoice;