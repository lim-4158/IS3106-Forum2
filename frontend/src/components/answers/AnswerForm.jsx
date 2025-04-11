import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  TextField
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const AnswerForm = ({ 
  questionId, 
  initialData = null, 
  onSubmit, 
  onCancel, 
  isEdit = false 
}) => {
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (initialData && initialData.body) {
      setBody(initialData.body);
    }
  }, [initialData]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!body.trim()) {
      setError('Please enter an answer');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const answerData = {
        body,
        questionId,
      };
      
      // If editing, include the answer ID
      if (isEdit && initialData) {
        answerData.answerId = initialData._id;
      }
      
      await onSubmit(answerData);
      
      // Reset form if not editing
      if (!isEdit) {
        setBody('');
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('Failed to submit answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          You need to be logged in to answer this question.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          href="/login"
        >
          Log In to Answer
        </Button>
      </Paper>
    );
  }
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {isEdit ? 'Edit your answer' : 'Your Answer'}
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Your answer"
            multiline
            rows={8}
            fullWidth
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your answer here..."
            required
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          {isEdit && (
            <Button 
              variant="outlined" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? 'Submitting...' : isEdit ? 'Update Answer' : 'Post Answer'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default AnswerForm; 