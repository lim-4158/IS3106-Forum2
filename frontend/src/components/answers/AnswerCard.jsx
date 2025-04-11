import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Button,
  Divider,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { voteAnswer } from '../../utils/api';
import { useToast } from '../../utils/toast.jsx';

const VoteBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(1),
  marginRight: theme.spacing(2),
}));

const AnswerCard = ({ 
  answer, 
  onEdit, 
  onDelete, 
  onVote, 
  questionAuthorId
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [anchorEl, setAnchorEl] = useState(null);
  const [voteLoading, setVoteLoading] = useState(false);
  
  const { _id, author, body, createdAt, upvotes, downvotes, netVotes } = answer;
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
    onEdit(answer);
  };
  
  const handleDelete = () => {
    handleMenuClose();
    onDelete(_id);
  };
  
  const handleVote = async (voteType) => {
    if (!currentUser) {
      showToast('You need to be logged in to vote', 'error');
      return;
    }
    
    if (voteLoading) return;
    
    setVoteLoading(true);
    try {
      console.log("voteType", voteType);
      const result = await voteAnswer(_id, voteType);
      console.log("result", result);
      if (result.success) {
        // Pass the updated answer to the parent component
        onVote(_id, result.answer);
        showToast(`Vote ${voteType === 'up' ? 'up' : 'down'} registered`, 'success');
      } else {
        showToast(result.message || 'Failed to vote', 'error');
      }
    } catch (error) {
      console.error('Error voting:', error);
      showToast('Failed to vote on answer', 'error');
    } finally {
      setVoteLoading(false);
    }
  };
  
  // Check if current user has already voted
  const hasUpvoted = currentUser && upvotes && upvotes.includes(currentUser._id);
  const hasDownvoted = currentUser && downvotes && downvotes.includes(currentUser._id);
  
  return (
    <Card sx={{ mb: 3, boxShadow: 2 }}>
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
          
          {/* Answer content */}
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                  <Typography variant="subtitle2" component="span">
                    {author?.username || 'Anonymous'}
                  </Typography>
                  {questionAuthorId === author?._id && (
                    <Typography 
                      variant="caption" 
                      bgcolor="primary.main" 
                      color="white" 
                      sx={{ ml: 1, px: 1, py: 0.5, borderRadius: 1 }}
                    >
                      Author
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon fontSize="inherit" sx={{ fontSize: '0.875rem', mr: 0.5 }} />
                    <Typography variant="caption" color="text.secondary">
                      {formattedDate}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* Actions menu for author */}
              {isAuthor && (
                <div>
                  <IconButton
                    aria-label="more"
                    id={`answer-menu-${_id}`}
                    aria-controls={open ? `answer-menu-${_id}-options` : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-haspopup="true"
                    onClick={handleMenuOpen}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    id={`answer-menu-${_id}-options`}
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
            
            <Divider sx={{ my: 1 }} />
            
            <Typography variant="body1" sx={{ mt: 2 }}>
              {/* Replace HTML rendering with plain text */}
              {body}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AnswerCard; 