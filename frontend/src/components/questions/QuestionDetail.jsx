import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { voteQuestion } from '../../utils/api';
import { useToast } from '../../utils/toast.jsx';

const TagContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const VoteBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(1),
  marginRight: theme.spacing(2),
}));

const QuestionDetail = ({ 
  question, 
  onEdit, 
  onDelete 
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [voteLoading, setVoteLoading] = useState(false);
  
  const { 
    _id, 
    title, 
    body, 
    tags, 
    author, 
    createdAt, 
    upvotes, 
    downvotes, 
    netVotes 
  } = question;


  const isAuthor = currentUser && author && currentUser._id === author._id;
  const formattedDate = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  const open = Boolean(anchorEl);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleEdit = () => {
    handleMenuClose();
    onEdit();
  };
  
  const handleDelete = () => {
    handleMenuClose();
    onDelete();
  };
  
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
        Object.assign(question, result.question);
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
  
  // Check if current user has already voted
  const hasUpvoted = currentUser && upvotes && upvotes.includes(currentUser._id);
  const hasDownvoted = currentUser && downvotes && downvotes.includes(currentUser._id);

  return (
    <Card sx={{ mb: 4, boxShadow: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex' }}>
          {/* Vote controls */}
          <VoteBox>
            <IconButton 
              size="small" 
              onClick={() => handleVote('up')}
              disabled={voteLoading}
              color={hasUpvoted ? 'success' : 'default'}
            >
              <ArrowUpwardIcon />
            </IconButton>
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 'bold', 
                my: 1,
                color: hasUpvoted ? 'success.main' : hasDownvoted ? 'error.main' : 'text.primary'
              }}
            >
              {netVotes || 0}
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => handleVote('down')}
              disabled={voteLoading}
              color={hasDownvoted ? 'error' : 'default'}
            >
              <ArrowDownwardIcon />
            </IconButton>
          </VoteBox>
          
          {/* Question content */}
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h5" component="h1" gutterBottom>
                {title}
              </Typography>
              
              {/* Actions menu for author */}
              {isAuthor && (
                <div>
                  <IconButton
                    aria-label="more"
                    id="question-menu"
                    aria-controls={open ? 'question-menu-options' : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-haspopup="true"
                    onClick={handleMenuOpen}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    id="question-menu-options"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={handleEdit}>Edit</MenuItem>
                    <MenuItem onClick={handleDelete}>Delete</MenuItem>
                  </Menu>
                </div>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {author?.profilePicture ? (
                <Avatar 
                  src={author.profilePicture} 
                  alt={author.username} 
                  sx={{ width: 32, height: 32, mr: 1 }}
                />
              ) : (
                <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                  <PersonIcon />
                </Avatar>
              )}
              <Box>
                <Typography variant="subtitle2">
                  {author?.username || 'Anonymous'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon fontSize="inherit" sx={{ fontSize: '0.875rem', mr: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    {formattedDate}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body1" sx={{ mb: 2 }}>
              {/* Replace HTML rendering with plain text */}
              {body}
            </Typography>
            
            <TagContainer>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  color="primary"
                  variant="outlined"
                  onClick={() => navigate(`/?tag=${tag}`)}
                />
              ))}
            </TagContainer>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuestionDetail; 