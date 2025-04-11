import { Container, Typography, Box } from '@mui/material';
import { Helmet } from 'react-helmet';
import QuestionForm from '../components/questions/QuestionForm';

const AskQuestionPage = () => {
  return (
    <Container maxWidth="lg">
      <Helmet>
        <title>Ask a Question | Forum</title>
      </Helmet>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Ask a Question
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Share your knowledge by asking a well-crafted question. Be sure to provide enough details for others to help you.
        </Typography>
      </Box>
      
      <QuestionForm />
    </Container>
  );
};

export default AskQuestionPage; 