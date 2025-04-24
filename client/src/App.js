// client/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route  } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  CssBaseline, 
  Container, 
  AppBar, 
  Toolbar, 
  Typography 
} from '@mui/material';

// Import components
import PaymentForm from './components/PaymentForm';
import PaymentPage from './components/PaymentPage';
import Invoice from './components/Invoice';
import NotFound from './components/NotFound';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <AppBar position="static" color="primary">
            <Toolbar>
            <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                    flexGrow: 1,
                    cursor: 'pointer', // Makes it look clickable
                    '&:hover': {
                        opacity: 0.8  // Optional: adds hover effect
                    }
                }}
                onClick={() => window.location.href="/"} // Adds navigation to home
            >
                Push Pay
            </Typography>
            </Toolbar>
          </AppBar>

          <Container maxWidth="md" sx={{ my: 4 }}>
            <Routes>
              <Route 
                path="/" 
                element={
                  <>
                    <PaymentForm />
                  </>
                } 
              />

              <Route 
                path="/pay/:paymentId" 
                element={
                  <>
                    <Typography variant="h4" gutterBottom>
                      Make Payment
                    </Typography>
                    <PaymentPage />
                  </>
                } 
              />

              <Route 
                path="/invoice/:paymentId" 
                element={
                  <>
                    <Typography variant="h4" gutterBottom>
                      Payment Invoice
                    </Typography>
                    <Invoice />
                  </>
                } 
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Container>

          <footer style={{ 
            textAlign: 'center', 
            padding: '1rem',
            marginTop: 'auto',
            backgroundColor: '#f5f5f5'
          }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Push Pay. All rights reserved.
            </Typography>
          </footer>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;