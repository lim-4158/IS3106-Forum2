import { Alert, AlertTitle, Box } from '@mui/material';

const ErrorAlert = ({ title = 'Error', message = 'An error occurred', severity = 'error' }) => {
  return (
    <Box sx={{ my: 2 }}>
      <Alert severity={severity}>
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Box>
  );
};

export default ErrorAlert; 