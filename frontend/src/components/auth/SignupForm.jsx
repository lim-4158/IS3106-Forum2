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
  Typography,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';

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
      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Password strength:</span> <span style={{ fontWeight: 'medium' }}>{label}</span>
      </Typography>
      <LinearProgress 
        variant="determinate" 
        value={strength} 
        color={color}
        sx={{ borderRadius: 4, height: 6 }}
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          {error}
        </Alert>
      )}
      
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
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PersonOutlineIcon color="action" />
            </InputAdornment>
          ),
          sx: { borderRadius: '10px' }
        }}
        sx={{ mb: 2 }}
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
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailOutlinedIcon color="action" />
            </InputAdornment>
          ),
          sx: { borderRadius: '10px' }
        }}
        sx={{ mb: 2 }}
      />
      
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type={showPassword ? "text" : "password"}
        id="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockOutlinedIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
          sx: { borderRadius: '10px' }
        }}
      />

      {password && <PasswordStrengthMeter password={password} />}
      
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Confirm Password"
        type={showConfirmPassword ? "text" : "password"}
        id="confirmPassword"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={confirmPassword && password !== confirmPassword}
        helperText={confirmPassword && password !== confirmPassword ? "Passwords don't match" : ""}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SecurityOutlinedIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                edge="end"
              >
                {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
          sx: { borderRadius: '10px' }
        }}
        sx={{ mb: 2 }}
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
        label={
          <Typography variant="body2">
            I agree to the{' '}
            <Link component={RouterLink} to="/terms" sx={{ textDecoration: 'none' }}>
              terms and conditions
            </Link>
          </Typography>
        }
        sx={{ mb: 2, mt: 1 }}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        sx={{ 
          mt: 1, 
          mb: 3, 
          py: 1.5, 
          borderRadius: '10px',
          textTransform: 'none',
          fontWeight: 'bold',
          fontSize: '1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
      
      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" color="text.secondary">
          OR
        </Typography>
      </Divider>
      
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Already have an account?
        </Typography>
        <Link 
          component={RouterLink} 
          to="/login" 
          variant="body1" 
          sx={{ 
            fontWeight: 'medium',
            textDecoration: 'none' 
          }}
        >
          Sign in here
        </Link>
      </Box>
    </form>
  );
};

export default SignupForm; 