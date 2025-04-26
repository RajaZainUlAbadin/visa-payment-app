import React, { useState, useCallback, useContext } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  Outlet,
  useNavigate 
} from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  CssBaseline, 
  Container, 
  AppBar, 
  Toolbar, 
  Typography,
  Button
} from '@mui/material';

// Import components
import PaymentForm from './components/PaymentForm';
import PaymentPage from './components/PaymentPage';
import Invoice from './components/Invoice';
import NotFound from './components/NotFound';
import Login from './components/LoginPage';  

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

// Authentication Context
const AuthContext = React.createContext({
  isAuthenticated: false,
  login: () => {},
  logout: () => {}
});

// Logout Component
const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  React.useEffect(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return null;
};

// Protected Route Component
const ProtectedRoute = () => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => 
    !!localStorage.getItem('token')
  );

  const login = useCallback((userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <ThemeProvider theme={theme}>
        <Router>
          <CssBaseline />
          <div className="App">
            <AppBar position="static" color="primary">
              <Toolbar>
                <Typography 
                  variant="h6" 
                  component="div" 
                  sx={{ 
                    flexGrow: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.8
                    }
                  }}
                  onClick={() => window.location.href="/"}
                >
                  Push Pay
                </Typography>
                {isAuthenticated && (
                  <Button color="inherit" href="/logout">
                    Logout
                  </Button>
                )}
              </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ my: 4 }}>
              <Routes>
                {/* Logout Route */}
                <Route path="/logout" element={<Logout />} />

                {/* Public Routes */}
                <Route 
                  path="/login" 
                  element={
                    isAuthenticated ? <Navigate to="/" replace /> : <Login />
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

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route 
                    path="/" 
                    element={<PaymentForm />} 
                  />
                </Route>

                {/* 404 Route */}
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
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default App;