import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Paper,
  Chip,
  Stack,
  Button,
  Card,
  Alert
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import AddIcon from '@mui/icons-material/Add';

const UserQuestions = ({ userQuestions }) => {
  // Sort questions by date (newest first)
  const sortedQuestions = [...userQuestions]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          My Questions ({userQuestions.length})
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/ask"
          sx={{ 
            borderRadius: 1,
            px: 2
          }}
        >
          ASK QUESTION
        </Button>
      </Box>
      
      {sortedQuestions.length === 0 ? (
        <Card variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
            You haven't asked any questions yet.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/ask"
            sx={{ 
              borderRadius: 1
            }}
          >
            ASK YOUR FIRST QUESTION
          </Button>
        </Card>
      ) : (
        <Paper 
          variant="outlined" 
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <List disablePadding>
            {sortedQuestions.map((question, index) => (
              <Box key={question._id}>
                <ListItem 
                  component={RouterLink}
                  to={`/questions/${question._id}`}
                  sx={{ 
                    textDecoration: 'none', 
                    color: 'inherit',
                    py: 2.5,
                    px: 3,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                        {question.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        {question.tags && question.tags.length > 0 && (
                          <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
                            {question.tags.map(tag => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                sx={{ 
                                  mr: 0.5, 
                                  mb: 0.5,
                                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                  color: 'primary.main',
                                  fontWeight: 500,
                                  fontSize: '0.7rem'
                                }}
                              />
                            ))}
                          </Stack>
                        )}
                        
                        <Stack direction="row" spacing={2}>
                          <Chip 
                            size="small" 
                            label={`Posted ${formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}`}
                            sx={{ 
                              height: '24px',
                              backgroundColor: 'rgba(0, 0, 0, 0.08)',
                              fontWeight: 400,
                              fontSize: '0.75rem'
                            }}
                          />
                          <Chip 
                            size="small" 
                            icon={<ThumbUpIcon sx={{ fontSize: '0.875rem' }} />}
                            label={`${question.netVotes || 0} votes`}
                            sx={{ 
                              height: '24px',
                              backgroundColor: question.netVotes > 0 
                                ? 'rgba(76, 175, 80, 0.1)' 
                                : 'rgba(0, 0, 0, 0.08)',
                              color: question.netVotes > 0 ? 'success.main' : 'text.secondary',
                              fontWeight: 400,
                              fontSize: '0.75rem'
                            }}
                          />
                          <Chip 
                            size="small" 
                            icon={<QuestionAnswerIcon sx={{ fontSize: '0.875rem' }} />}
                            label={`${question.answerCount || 0} answers`}
                            sx={{ 
                              height: '24px',
                              backgroundColor: question.answerCount > 0 
                                ? 'rgba(25, 118, 210, 0.1)' 
                                : 'rgba(0, 0, 0, 0.08)',
                              color: question.answerCount > 0 ? 'primary.main' : 'text.secondary',
                              fontWeight: 400,
                              fontSize: '0.75rem'
                            }}
                          />
                        </Stack>
                      </Box>
                    }
                  />
                </ListItem>
                {index < sortedQuestions.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default UserQuestions; 