import { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import QuestionForm from '../components/questions/QuestionForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { getQuestionById } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../utils/toast.jsx';

const EditQuestionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchQuestion();
  }, [id]);
  
  const fetchQuestion = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getQuestionById(id);
      
      if (response.success) {
        // Check if the current user is the author
        if (currentUser && response.question.author && 
          currentUser._id === response.question.author._id) {
          setQuestion(response.question);
        } else {
          // User is not the author, redirect to the question page
          showToast('You do not have permission to edit this question', 'error');
          navigate(`/questions/${id}`);
        }
      } else {
        setError(response.message || 'Failed to fetch question');
      }
    } catch (err) {
      console.error('Error fetching question:', err);
      setError('Failed to load question. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading question..." />;
  }
  
  if (error) {
    return (
      <Container maxWidth="lg">
        <ErrorAlert message={error} />
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Helmet>
        <title>Edit Question | Forum</title>
      </Helmet>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Question
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Update your question to improve clarity or add more details.
        </Typography>
      </Box>
      
      {question && (
        <QuestionForm 
          initialData={question} 
          isEdit={true} 
        />
      )}
    </Container>
  );
};

export default EditQuestionPage; 