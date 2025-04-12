import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Pagination,
  Paper,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import QuestionCard from '../components/questions/QuestionCard';
import FilterControls from '../components/questions/FilterControls';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { getQuestions } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const QuestionListPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popularTags, setPopularTags] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams] = useSearchParams();
  
  const { isAuthenticated } = useAuth();
  
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchQuestions();
  }, [searchParams]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = Object.fromEntries(searchParams.entries());
      const response = await getQuestions(params);
      
      if (response.success) {
        setQuestions(response.questions || []);
        
        // Extract popular tags (this would be better done server-side)
        const allTags = response.questions.flatMap(q => q.tags);
        const tagCounts = allTags.reduce((acc, tag) => {
          acc[tag] = (acc[tag] || 0) + 1;
          return acc;
        }, {});
        
        const sortedTags = Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([tag]) => tag);
        
        setPopularTags(sortedTags);
        
        // Calculate pagination
        setTotalPages(Math.ceil(response.questions.length / ITEMS_PER_PAGE));
      } else {
        setError(response.message || 'Failed to fetch questions');
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleFilter = (filters) => {
    // Filtering is handled through URL params and the useEffect
    setPage(1); // Reset to first page when filters change
  };
  
  const handleQuestionVote = (questionId, updatedQuestion) => {
    // Update the question in the list with the updated question from the API
    setQuestions(questions.map(q => 
      q._id === questionId ? updatedQuestion : q
    ));
  };

  // Get paginated questions
  const paginatedQuestions = questions.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <Container maxWidth="lg">
      <Helmet>
        <title>Questions | Forum</title>
      </Helmet>
      
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
        >
          <Typography variant="h4" component="h1">
            Questions
          </Typography>
          
          {isAuthenticated && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/ask"
              sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
            >
              Ask Question
            </Button>
          )}
        </Stack>
      </Box>
      
      {/* Filter Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 4, 
          p: 2, 
          backgroundColor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <FilterControls 
          onFilter={handleFilter} 
          popularTags={popularTags} 
        />
      </Paper>
      
      {/* Questions List Section */}
      {loading ? (
        <LoadingSpinner message="Loading questions..." />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : questions.length === 0 ? (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            backgroundColor: 'background.default',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No questions found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {searchParams.toString() ? 'Try adjusting your filters' : 'Be the first to ask a question!'}
          </Typography>
          
          {isAuthenticated && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/ask"
              sx={{ mt: 2 }}
            >
              Ask Question
            </Button>
          )}
        </Paper>
      ) : (
        <Stack spacing={2}>
          {paginatedQuestions.map((question) => (
            <QuestionCard 
              key={question._id} 
              question={question} 
              onVote={handleQuestionVote}
            />
          ))}
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </Stack>
      )}
    </Container>
  );
};

export default QuestionListPage; 