import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid,
  Tabs,
  Tab,
  Paper,
  Avatar,
  Stack,
  Divider,
  Chip
} from '@mui/material';
import { Helmet } from 'react-helmet';
import { useAuth } from '../contexts/AuthContext';
import ProfileForm from '../components/profile/ProfileForm';
import UserQuestions from '../components/profile/UserQuestions';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { getUserQuestions, getUserAnswers } from '../utils/api';
import PersonIcon from '@mui/icons-material/Person';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

// TabPanel component to handle tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [value, setValue] = useState(0);
  const [userQuestions, setUserQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (currentUser) {
      fetchUserActivity();
    } else {
      setLoading(false);
    }
  }, [currentUser]);
  
  const fetchUserActivity = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch user's questions and answers using the new API functions
      const [questionsResponse, answersResponse] = await Promise.all([
        getUserQuestions(currentUser._id),
        getUserAnswers(currentUser._id)
      ]);
      
      if (questionsResponse && answersResponse) {
        setUserQuestions(questionsResponse || []);
        setUserAnswers(answersResponse || []);
      } else {
        setError('Failed to fetch user activity');
      }
    } catch (err) {
      console.error('Error fetching user activity:', err);
      setError('Failed to load user activity. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }
  
  if (!currentUser) {
    return (
      <Container maxWidth="lg">
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            Not Logged In
          </Typography>
          <Typography variant="body1">
            Please log in to view your profile.
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Calculate some basic stats for the header
  const totalQuestions = userQuestions.length;
  
  return (
    <Container maxWidth="lg">
      <Helmet>
        <title>My Profile | Forum</title>
      </Helmet>
      
      <Breadcrumbs
        items={[
          { label: 'Profile' }
        ]}
      />
      
      {/* Profile Header */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: 4,
          borderRadius: 2,
          background: 'linear-gradient(to right, #f7f9fc, #edf2f7)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
            <Avatar
              src={currentUser.profilePicture}
              alt={currentUser.username}
              sx={{ 
                width: 120, 
                height: 120,
                border: '4px solid white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
            >
              {currentUser.username?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </Grid>
          <Grid item xs={12} md={7}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ 
              fontWeight: 700,
              textAlign: { xs: 'center', md: 'left' }
            }}>
              {currentUser.username}
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ mb: 2, textAlign: { xs: 'center', md: 'left' } }}
            >
              {currentUser.email}
            </Typography>
            {currentUser.bio && (
              <Typography 
                variant="body2" 
                sx={{ 
                  fontStyle: 'italic',
                  textAlign: { xs: 'center', md: 'left' }
                }}
              >
                {currentUser.bio}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
            }}>
              <Chip 
                label={`${totalQuestions} Questions`} 
                color="primary" 
                sx={{ 
                  px: 2,
                  height: 40, 
                  fontWeight: 500, 
                  fontSize: '1rem' 
                }}
                icon={<QuestionAnswerIcon />}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {error && <ErrorAlert message={error} sx={{ mb: 3 }} />}
      
      {/* Tabs */}
      <Paper 
        elevation={0} 
        sx={{
          mb: 4,
          overflow: 'hidden',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ borderBottom: 0 }}>
          <Tabs 
            value={value} 
            onChange={handleTabChange}
            aria-label="profile tabs"
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
              },
              borderBottom: 1,
              borderColor: 'divider',
              backgroundColor: '#f8fafc'
            }}
          >
            <Tab 
              label="Profile Information" 
              icon={<PersonIcon />} 
              iconPosition="start"
              id="profile-tab-0" 
              sx={{ py: 2 }}
            />
            <Tab 
              label="Questions" 
              icon={<QuestionAnswerIcon />} 
              iconPosition="start"
              id="profile-tab-1" 
              sx={{ py: 2 }}
            />
          </Tabs>
        </Box>
        
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <TabPanel value={value} index={0}>
            <ProfileForm />
          </TabPanel>
          
          <TabPanel value={value} index={1}>
            <UserQuestions 
              userQuestions={userQuestions}
            />
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage; 