import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Divider, 
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import QuestionDetail from '../components/questions/QuestionDetail';
import AnswerCard from '../components/answers/AnswerCard';
import AnswerForm from '../components/answers/AnswerForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../utils/toast.jsx';
import { 
  getQuestionById, 
  getAnswersByQuestion,
  deleteQuestion, 
  createAnswer, 
  updateAnswer, 
  deleteAnswer,
  voteAnswer
} from '../utils/api';

const QuestionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAnswerDialogOpen, setDeleteAnswerDialogOpen] = useState(false);
  const [answerToDelete, setAnswerToDelete] = useState(null);
  const [answerToEdit, setAnswerToEdit] = useState(null);
  
  useEffect(() => {
    fetchQuestionAndAnswers();
  }, [id]);
  
  const fetchQuestionAndAnswers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch question details
      const questionResponse = await getQuestionById(id);
      
      console.log("Question response:", questionResponse);
      
      if (!questionResponse.success) {
        setError(questionResponse.message || 'Failed to fetch question');
        setLoading(false);
        return;
      }
      
      setQuestion(questionResponse.question);
      
      // Fetch answers for this question
      const answersResponse = await getAnswersByQuestion(id);
      
      console.log("Answers response:", answersResponse);
      
      if (answersResponse.success) {
        setAnswers(answersResponse.answers || []);
      } else {
        console.error('Failed to fetch answers:', answersResponse.message);
        // We still have the question, so just show empty answers
        setAnswers([]);
      }
    } catch (err) {
      console.error('Error fetching question and answers:', err);
      setError('Failed to load question. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditQuestion = () => {
    navigate(`/edit-question/${id}`);
  };
  
  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleDeleteQuestion = async () => {
    try {
      const response = await deleteQuestion(id);
      
      if (response.success) {
        showToast('Question deleted successfully', 'success');
        navigate('/');
      } else {
        showToast(response.message || 'Failed to delete question', 'error');
      }
    } catch (err) {
      console.error('Error deleting question:', err);
      showToast('An error occurred while deleting the question', 'error');
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  
  const handleSubmitAnswer = async (answerData) => {
    try {
      let response;
      
      if (answerToEdit) {
        response = await updateAnswer(answerToEdit._id, answerData);
        if (response.success) {
          // Update the answer in the list
          setAnswers(answers.map(a => 
            a._id === answerToEdit._id ? response.answer : a
          ));
          setAnswerToEdit(null);
          showToast('Answer updated successfully', 'success');
        }
      } else {
        response = await createAnswer(answerData);
        if (response.success) {
          // Add the new answer to the list
          setAnswers([...answers, response.answer]);
          showToast('Answer posted successfully', 'success');
        }
      }
      
      if (!response.success) {
        showToast(response.message || 'Failed to save answer', 'error');
      }
      
      return response;
    } catch (err) {
      console.error('Error saving answer:', err);
      showToast('An error occurred while saving the answer', 'error');
      throw err;
    }
  };
  
  const handleEditAnswer = (answer) => {
    setAnswerToEdit(answer);
    // Scroll to the answer form
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  };
  
  const handleCancelEditAnswer = () => {
    setAnswerToEdit(null);
  };
  
  const handleDeleteAnswerDialogOpen = (answerId) => {
    setAnswerToDelete(answerId);
    setDeleteAnswerDialogOpen(true);
  };
  
  const handleDeleteAnswerDialogClose = () => {
    setDeleteAnswerDialogOpen(false);
    setAnswerToDelete(null);
  };
  
  const handleDeleteAnswer = async () => {
    if (!answerToDelete) return;
    
    try {
      const response = await deleteAnswer(answerToDelete);
      
      if (response.success) {
        // Remove the deleted answer from the list
        setAnswers(answers.filter(a => a._id !== answerToDelete));
        showToast('Answer deleted successfully', 'success');
      } else {
        showToast(response.message || 'Failed to delete answer', 'error');
      }
    } catch (err) {
      console.error('Error deleting answer:', err);
      showToast('An error occurred while deleting the answer', 'error');
    } finally {
      setDeleteAnswerDialogOpen(false);
      setAnswerToDelete(null);
    }
  };
  
  const handleAnswerVote = async (answerId, updatedAnswer) => {
    try {
      // Update the answer in the list with the updated answer from the API
      setAnswers(answers.map(a => 
        a._id === answerId ? updatedAnswer : a
      ));
    } catch (err) {
      console.error('Error updating answer vote:', err);
      showToast('An error occurred while updating the vote', 'error');
    }
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading question..." />;
  }
  
  if (error) {
    return (
      <Container maxWidth="lg">
        <ErrorAlert message={error} />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Back to Questions
        </Button>
      </Container>
    );
  }
  
  if (!question) {
    return (
      <Container maxWidth="lg">
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Question not found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            The question you're looking for doesn't exist or has been removed.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/')}
          >
            Back to Questions
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Helmet>
        <title>{question.title} | Forum</title>
      </Helmet>
      
      <Breadcrumbs
        items={[
          { label: 'Questions', path: '/' },
          { label: question.title }
        ]}
      />
      
      <QuestionDetail
        question={question}
        onEdit={handleEditQuestion}
        onDelete={handleDeleteDialogOpen}
        setQuestion={setQuestion}
      />
      
      {/* Answers section */}
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h5" component="h2">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </Typography>
        <Divider sx={{ mt: 1, mb: 3 }} />
        
        {answers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body1" color="text.secondary">
              No answers yet. Be the first to answer this question!
            </Typography>
          </Box>
        ) : (
          answers.map((answer) => (
            <AnswerCard 
              key={answer._id}
              answer={answer}
              onEdit={handleEditAnswer}
              onDelete={handleDeleteAnswerDialogOpen}
              onVote={handleAnswerVote}
              questionAuthorId={question.author?._id}
            />
          ))
        )}
      </Box>
      
      {/* Answer form */}
      <Box sx={{ mt: 4 }}>
        <AnswerForm 
          questionId={id}
          initialData={answerToEdit}
          onSubmit={handleSubmitAnswer}
          onCancel={handleCancelEditAnswer}
          isEdit={!!answerToEdit}
        />
      </Box>
      
      {/* Delete question dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Question</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this question? This action cannot be undone.
            All answers to this question will also be deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteQuestion} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete answer dialog */}
      <Dialog
        open={deleteAnswerDialogOpen}
        onClose={handleDeleteAnswerDialogClose}
      >
        <DialogTitle>Delete Answer</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this answer? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteAnswerDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteAnswer} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuestionDetailPage; 