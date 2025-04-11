import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
  Chip,
  Autocomplete
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createQuestion, updateQuestion } from '../../utils/api';
import { useToast } from '../../utils/toast.jsx';

// Common tags that might be used in the forum
const commonTags = [
  'javascript', 'react', 'node.js', 'express', 'mongodb',
  'html', 'css', 'python', 'java', 'c#', 'php',
  'database', 'api', 'frontend', 'backend', 'fullstack',
  'deployment', 'testing', 'security', 'performance'
];

const QuestionForm = ({ initialData = null, isEdit = false }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  useEffect(() => {
    // Populate form with initial data if editing
    if (initialData) {
      setTitle(initialData.title || '');
      setBody(initialData.body || '');
      setTags(initialData.tags || []);
    }
  }, [initialData]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    
    if (!body.trim()) {
      setError('Please enter question details');
      return;
    }
    
    if (tags.length === 0) {
      setError('Please add at least one tag');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const questionData = {
        title,
        body,
        tags,
      };
      
      let response;
      
      if (isEdit && initialData) {
        response = await updateQuestion(initialData._id, questionData);
      } else {
        response = await createQuestion(questionData);
      }
      
      if (response.success) {
        showToast(
          isEdit 
            ? 'Question updated successfully' 
            : 'Question posted successfully', 
          'success'
        );
        
        // Navigate to the question page
        navigate(`/questions/${response.question._id}`);
      } else {
        setError(response.message || 'Failed to save question');
      }
    } catch (err) {
      console.error('Error saving question:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTagChange = (event, newTags) => {
    // Ensure tags are unique and lowercase
    const processedTags = [...new Set(newTags.map(tag => tag.toLowerCase()))];
    setTags(processedTags);
  };
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        {isEdit ? 'Edit Question' : 'Ask a Question'}
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          variant="outlined"
          fullWidth
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's your question? Be specific."
          sx={{ mb: 3 }}
          inputProps={{ maxLength: 150 }}
          helperText={`${title.length}/150 characters`}
        />
        
        <Typography variant="subtitle1" gutterBottom>
          Details
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Question details"
            placeholder="Include all the information someone would need to answer your question"
            multiline
            rows={10}
            fullWidth
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </Box>
        
        <Autocomplete
          multiple
          freeSolo
          options={commonTags}
          value={tags}
          onChange={handleTagChange}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip 
                label={option} 
                {...getTagProps({ index })} 
                color="primary" 
                variant="outlined" 
                size="small" 
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tags"
              placeholder="Add relevant tags"
              helperText="Press Enter to add a tag"
              required
            />
          )}
          sx={{ mb: 3 }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate(isEdit ? `/questions/${initialData._id}` : '/')}
            disabled={loading}
          >
            Cancel
          </Button>
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading 
              ? (isEdit ? 'Updating...' : 'Posting...') 
              : (isEdit ? 'Update Question' : 'Post Question')
            }
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default QuestionForm; 