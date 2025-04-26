// src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../App';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const auth = useAuthContext();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('https://jumarisllc.com/api/auth/login', { 
        email, 
        password 
      });

      // Assuming the response contains user data and token
      const { user, token } = response.data;

      // Use the login method from auth context
      auth.login(user, token);

      // Navigate to home page
      navigate('/');
    } catch (error) {
      setError('Login failed. Please check your credentials.');
      console.error('Login error', error);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper 
        elevation={3} 
        sx={{ 
          marginTop: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          padding: 3 
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box 
          component="form" 
          onSubmit={handleLogin} 
          sx={{ width: '100%', mt: 1 }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;