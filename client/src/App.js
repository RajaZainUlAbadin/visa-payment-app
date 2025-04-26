import React, { useState, useEffect } from 'react';
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

// Authentication Context (you can expand this)
const AuthContext = React.createContext(null);

// Protected Route Component
const ProtectedRoute = () => {
  const auth = useAuth();
  
  return auth.isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Authentication Hook
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return { 
    isAuthenticated, 
    user, 
    login, 
    logout 
  };
};

// Create a separate Logout component
const Logout = () => {
  const navigate = useNavigate();
  const auth = useAuthContext();

  useEffect(() => {
    auth.logout();
    navigate('/login');
  }, []);

  return null;
};

function App() {
  const auth = useAuth();
  const handleLogout = () => {
    auth.logout();
  };

  return (
    <AuthContext.Provider value={auth}>
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
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.8
                    }
                  }}
                  onClick={() => window.location.href="/"}
                >
                  Push Pay
                </Typography>
                {auth.isAuthenticated && (
                  <Button color="inherit" href="/logout">
                    Logout
                  </Button>
                )}
              </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ my: 4 }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={
                  auth.isAuthenticated ? <Navigate to="/" replace /> : <Login />
                } />

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

                <Route path="/logout" element={<Logout />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route 
                    path="/" 
                    element={
                      <>
                        <PaymentForm />
                      </>
                    } 
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
  return React.useContext(AuthContext);
};

export default App;