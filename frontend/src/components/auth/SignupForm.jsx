import { useState } from 'react';
import { 
  TextField, 
  Button, 
  Grid, 
  Link, 
  Alert,
  FormControlLabel,
  Checkbox,
  Box,
  LinearProgress,
  Typography 
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Password strength indicator
const PasswordStrengthMeter = ({ password }) => {
  const calculateStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const strength = calculateStrength(password);
  
  let color = 'error';
  let label = 'Weak';
  
  if (strength >= 75) {
    color = 'success';
    label = 'Strong';
  } else if (strength >= 50) {
    color = 'warning';
    label = 'Moderate';
  } else if (strength >= 25) {
    color = 'error';
    label = 'Weak';
  }

  return (
    <Box sx={{ width: '100%', mt: 1, mb: 2 }}>
      <Typography variant="caption" color="text.secondary">
        Password strength: {label}
      </Typography>
      <LinearProgress 
        variant="determinate" 
        value={strength} 
        color={color}
        sx={{ borderRadius: 1, height: 8 }}
      />
    </Box>
  );
};

const SignupForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      const result = await register(username, email, password);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id="username"
        label="Username"
        name="username"
        autoComplete="username"
        autoFocus
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={email && !validateEmail(email)}
        helperText={email && !validateEmail(email) ? "Please enter a valid email" : ""}
      />
      
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {password && <PasswordStrengthMeter password={password} />}
      
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        id="confirmPassword"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={confirmPassword && password !== confirmPassword}
        helperText={confirmPassword && password !== confirmPassword ? "Passwords don't match" : ""}
      />
      
      <FormControlLabel
        control={
          <Checkbox 
            value="agreeTerms" 
            color="primary" 
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
          />
        }
        label="I agree to the terms and conditions"
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Sign Up'}
      </Button>
      
      <Grid container justifyContent="flex-end">
        <Grid item>
          <Link component={RouterLink} to="/login" variant="body2">
            Already have an account? Sign in
          </Link>
        </Grid>
      </Grid>
    </form>
  );
};

export default SignupForm; 