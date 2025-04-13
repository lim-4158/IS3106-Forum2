import { Box, Paper, Typography, Container, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  marginBottom: theme.spacing(8),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(5),
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
  borderRadius: '12px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '5px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  }
}));

const AuthForm = ({ children, title, subtitle }) => {
  const theme = useTheme();
  
  return (
    <Container component="main" maxWidth="sm">
      <StyledPaper>
        <Typography 
          component="h1" 
          variant="h4" 
          sx={{ 
            mb: 1, 
            fontWeight: 'bold',
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ mb: 4, textAlign: 'center', maxWidth: '80%' }}
          >
            {subtitle}
          </Typography>
        )}
        <Box sx={{ width: '100%', mt: 1 }}>
          {children}
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default AuthForm; 