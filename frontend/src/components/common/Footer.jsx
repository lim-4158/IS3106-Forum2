import { Box, Container, Typography, Link, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box component="footer" sx={{ mt: 5, py: 3, bgcolor: 'rgba(0, 0, 0, 0.03)' }}>
      <Divider />
      <Container maxWidth="lg">
        <Box sx={{ py: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 2, md: 0 } }}>
            © {new Date().getFullYear()} Forum. All rights reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link component={RouterLink} to="/" color="inherit" underline="hover">
              Home
            </Link>
            <Link component={RouterLink} to="/about" color="inherit" underline="hover">
              About
            </Link>
            <Link component={RouterLink} to="/privacy" color="inherit" underline="hover">
              Privacy
            </Link>
            <Link component={RouterLink} to="/terms" color="inherit" underline="hover">
              Terms
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 