import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Paper,
  Grid,
  Chip,
  Stack,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

const UserStats = ({ userQuestions, userAnswers }) => {
  // Calculate total stats
  const totalQuestions = userQuestions.length;
  const totalAnswers = userAnswers.length;
  const totalVotes = userQuestions.reduce((sum, q) => sum + (q.netVotes || 0), 0) +
                    userAnswers.reduce((sum, a) => sum + (a.netVotes || 0), 0);
  
  // Get recent activity (last 5 items)
  const recentQuestions = [...userQuestions]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
    
  const recentAnswers = [...userAnswers]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <Box>
      {/* Stats Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card elevation={2} sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #6B8DD6 0%, #8E37D7 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <QuestionAnswerIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Questions</Typography>
              </Box>
              <Typography variant="h3">{totalQuestions}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Total questions asked
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card elevation={2} sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #FF9F43 0%, #FF7F50 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Answers</Typography>
              </Box>
              <Typography variant="h3">{totalAnswers}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Total answers provided
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card elevation={2} sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #4CAF50 0%, #45B649 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ThumbUpIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Votes</Typography>
              </Box>
              <Typography variant="h3">{totalVotes}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Total votes received
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity Section */}
      <Grid container spacing={4}>
        {/* Recent Questions */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: 'primary.main',
              fontWeight: 600
            }}>
              <QuestionAnswerIcon sx={{ mr: 1 }} />
              Recent Questions
            </Typography>
            
            {recentQuestions.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No questions asked yet.
              </Typography>
            ) : (
              <List sx={{ pt: 0 }}>
                {recentQuestions.map((question, index) => (
                  <Box key={question._id}>
                    <ListItem 
                      component={RouterLink}
                      to={`/questions/${question._id}`}
                      sx={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        py: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          borderRadius: 1
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {question.title}
                          </Typography>
                        }
                        secondary={
                          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Chip 
                              size="small" 
                              label={`${formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}`}
                              sx={{ fontSize: '0.75rem' }}
                            />
                            <Chip 
                              size="small" 
                              icon={<ThumbUpIcon sx={{ fontSize: '1rem' }} />}
                              label={question.netVotes || 0}
                              color={question.netVotes > 0 ? 'success' : 'default'}
                              sx={{ fontSize: '0.75rem' }}
                            />
                            <Chip 
                              size="small" 
                              icon={<QuestionAnswerIcon sx={{ fontSize: '1rem' }} />}
                              label={question.answerCount || 0}
                              sx={{ fontSize: '0.75rem' }}
                            />
                          </Stack>
                        }
                      />
                    </ListItem>
                    {index < recentQuestions.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Recent Answers */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: 'primary.main',
              fontWeight: 600
            }}>
              <TrendingUpIcon sx={{ mr: 1 }} />
              Recent Answers
            </Typography>
            
            {recentAnswers.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No answers provided yet.
              </Typography>
            ) : (
              <List sx={{ pt: 0 }}>
                {recentAnswers.map((answer, index) => (
                  <Box key={answer._id}>
                    <ListItem 
                      component={RouterLink}
                      to={`/questions/${answer.questionId}`}
                      sx={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        py: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          borderRadius: 1
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {answer.questionTitle || 'Question'}
                          </Typography>
                        }
                        secondary={
                          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Chip 
                              size="small" 
                              label={`${formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}`}
                              sx={{ fontSize: '0.75rem' }}
                            />
                            <Chip 
                              size="small" 
                              icon={<ThumbUpIcon sx={{ fontSize: '1rem' }} />}
                              label={answer.netVotes || 0}
                              color={answer.netVotes > 0 ? 'success' : 'default'}
                              sx={{ fontSize: '0.75rem' }}
                            />
                          </Stack>
                        }
                      />
                    </ListItem>
                    {index < recentAnswers.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserStats; 