import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import { Helmet } from 'react-helmet';
import { useAuth } from '../contexts/AuthContext';
import ProfileForm from '../components/profile/ProfileForm';
import UserStats from '../components/profile/UserStats';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { getUserQuestions, getUserAnswers } from '../utils/api';

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
      console.log("sdfsd");
      console.log(questionsResponse);
      console.log(answersResponse);
      
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
        <Paper sx={{ p: 3, textAlign: 'center' }}>
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
  
  return (
    <Container maxWidth="lg">
      <Helmet>
        <title>My Profile | Forum</title>
      </Helmet>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account and view your activity
        </Typography>
      </Box>
      
      {error && <ErrorAlert message={error} sx={{ mb: 3 }} />}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={value} 
          onChange={handleTabChange}
          aria-label="profile tabs"
        >
          <Tab label="Profile Information" id="profile-tab-0" />
          <Tab label="Activity" id="profile-tab-1" />
        </Tabs>
      </Box>
      
      <TabPanel value={value} index={0}>
        <ProfileForm />
      </TabPanel>
      
      <TabPanel value={value} index={1}>
        <UserStats 
          userQuestions={userQuestions}
          userAnswers={userAnswers}
        />
      </TabPanel>
    </Container>
  );
};

export default ProfilePage; 