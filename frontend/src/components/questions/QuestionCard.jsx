import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip,
  Stack,
  Grid,
  Button,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CommentIcon from '@mui/icons-material/Comment';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Link as RouterLink } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { voteQuestion } from '../../utils/api';
import { useToast } from '../../utils/toast.jsx';
import { useState } from 'react';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const VoteCount = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 60,
  padding: theme.spacing(1),
  borderRight: `1px solid ${theme.palette.divider}`,
}));

const TagsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(1.5),
}));

const TruncatedTypography = styled(Typography)({
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const QuestionCard = ({ question, onVote }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [voteLoading, setVoteLoading] = useState(false);
  
  const { 
    _id, 
    title, 
    body, 
    author, 
    tags, 
    createdAt, 
    upvotes, 
    downvotes, 
    netVotes, 
    answerCount = 0 
  } = question;

  console.log("QuestionCard author:", author);
  
  const formattedDate = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  
  // Check if current user has already voted
  const hasUpvoted = currentUser && upvotes && upvotes.includes(currentUser.id);
  const hasDownvoted = currentUser && downvotes && downvotes.includes(currentUser.id);
  
  const handleVote = async (voteType) => {
    if (!currentUser) {
      showToast('You need to be logged in to vote', 'error');
      return;
    }
    
    if (voteLoading) return;
    
    setVoteLoading(true);
    try {
      const result = await voteQuestion(_id, voteType);
      if (result.success) {
        // Update the question with new vote counts
        if (onVote) {
          onVote(_id, result.question);
        }
        showToast(`Vote ${voteType === 'up' ? 'up' : 'down'} registered`, 'success');
      } else {
        showToast(result.message || 'Failed to vote', 'error');
      }
    } catch (error) {
      console.error('Error voting:', error);
      showToast('Failed to vote on question', 'error');
    } finally {
      setVoteLoading(false);
    }
  };

  return (
    <StyledCard>
      <CardContent sx={{ p: 0 }}>
        <Grid container>
          {/* Vote count */}
          <Grid item>
            <VoteCount>
              <IconButton 
                size="small" 
                onClick={() => handleVote('up')}
                disabled={voteLoading}
                color={hasUpvoted ? "success" : "default"}
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
              <Typography 
                variant="h6" 
                color={hasUpvoted ? "success.main" : hasDownvoted ? "error.main" : "text.secondary"}
              >
                {netVotes}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => handleVote('down')}
                disabled={voteLoading}
                color={hasDownvoted ? "error" : "default"}
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </VoteCount>
          </Grid>
          
          {/* Question content */}
          <Grid item xs>
            <Box sx={{ p: 2 }}>
              <Typography 
                variant="h6" 
                component={RouterLink} 
                to={`/questions/${_id}`}
                sx={{ 
                  textDecoration: 'none',
                  color: 'primary.main',
                  '&:hover': {
                    color: 'primary.dark',
                    textDecoration: 'underline',
                  }
                }}
              >
                {title}
              </Typography>
              
              <TruncatedTypography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {body}
              </TruncatedTypography>
              
              <TagsContainer>
                {tags.map((tag) => (
                  <Chip 
                    key={tag} 
                    label={tag} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                ))}
              </TagsContainer>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {author?.username || 'Anonymous'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {formattedDate}
                    </Typography>
                  </Box>
                </Stack>
                
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </StyledCard>
  );
};

export default QuestionCard; 