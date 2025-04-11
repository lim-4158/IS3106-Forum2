import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ToastProvider from './utils/toast.jsx';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import QuestionListPage from './pages/QuestionListPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import AskQuestionPage from './pages/AskQuestionPage';
import EditQuestionPage from './pages/EditQuestionPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
// Import other pages when we create them

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Public only route (redirect if logged in)
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// App with Router
const AppWithRouter = () => {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<QuestionListPage />} />
                <Route path="/questions/:id" element={<QuestionDetailPage />} />
                
                {/* Public Only Routes (not accessible when logged in) */}
                <Route path="/login" element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                } />
                <Route path="/register" element={
                  <PublicOnlyRoute>
                    <SignupPage />
                  </PublicOnlyRoute>
                } />
                
                {/* Protected Routes */}
                <Route path="/ask" element={
                  <ProtectedRoute>
                    <AskQuestionPage />
                  </ProtectedRoute>
                } />
                <Route path="/edit-question/:id" element={
                  <ProtectedRoute>
                    <EditQuestionPage />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
};

// Main App Component
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppWithRouter />
    </ThemeProvider>
  );
}

export default App;
