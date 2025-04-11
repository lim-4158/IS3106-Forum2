const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');
const database = require('./lib/database');
const handlers = require('./handlers/handlers');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// JWT Secret
app.set('jwtSecret', process.env.JWT_SECRET || 'your_jwt_secret_key');

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Setup multer for file uploads
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 // 1MB limit
  }
});

// Middleware to verify JWT token
const auth = (req, res, next) => {
  // Get auth header value
  const bearerHeader = req.headers['authorization'];
  
  if (typeof bearerHeader !== 'undefined') {
    // Split at the space
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];
    
    // Verify token
    jwt.verify(bearerToken, app.get('jwtSecret'), (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid'
        });
      } else {
        // Add user info to request
        req.user = decoded;
        next();
      }
    });
  } else {
    // Forbidden
    res.status(403).json({
      success: false,
      message: 'No token provided'
    });
  }
};

// Routes
// Auth routes
app.post('/api/auth/login', handlers.login);
app.post('/api/auth/register', handlers.register);

// User routes (protected)
app.get('/api/users/profile', auth, handlers.getProfile);
app.put('/api/users/profile', auth, handlers.updateProfile);
app.post('/api/users/profile/image', auth, upload.single('image'), handlers.uploadProfileImage);

// Get user's questions
app.get('/api/users/:id/questions', async (req, res) => {
  try {
    const questions = await database.getQuestionsByUser(req.params.id);
    res.json(questions);
  } catch (error) {
    console.error('Error fetching user questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's answers
app.get('/api/users/:id/answers', async (req, res) => {
  try {
    const answers = await database.getAnswersByUser(req.params.id);
    res.json(answers);
  } catch (error) {
    console.error('Error fetching user answers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Question routes
app.get('/api/questions', handlers.getQuestions);
app.get('/api/questions/:id', handlers.getQuestion);
app.post('/api/questions', auth, handlers.addQuestion);
app.put('/api/questions/:id', auth, handlers.updateQuestion);
app.delete('/api/questions/:id', auth, handlers.deleteQuestion);
app.post('/api/questions/:id/vote', auth, handlers.voteQuestion);

// Answer routes
app.post('/api/answers', auth, handlers.addAnswer);
app.get('/api/answers/question/:id', handlers.getAnswersByQuestion);
app.put('/api/answers/:id', auth, handlers.updateAnswer);
app.delete('/api/answers/:id', auth, handlers.deleteAnswer);
app.post('/api/answers/:id/vote', auth, handlers.voteAnswer);

// Initialize database connection
database.initDBIfNecessary().then(() => {
  // Start server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await database.disconnect();
  process.exit(0);
}); 