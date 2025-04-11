const db = require("../lib/database");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');

/* ---------------------------------------------------------------------------
    Authentication Handlers
  --------------------------------------------------------------------------- */
// Handle user login
async function login(req, res) {
  const { username, password } = req.body;

  try {
    const user = await db.getUserByUsername(username);

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid username or password" 
      });
    }

    // If using plain text passwords (should be changed to bcrypt in production)
    // Ideally, you would use bcrypt to compare:
    // const isMatch = await bcrypt.compare(password, user.password);
    if (user.password !== password) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid username or password" 
      });
    }

    // User matched, create JWT
    const payload = {
      id: user._id.toString(),
      username: user.username
    };

    // Sign token
    jwt.sign(
      payload,
      req.app.get('jwtSecret'),
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token: `Bearer ${token}`,
          user: {
            id: user._id,
            username: user.username,
            email: user.email
          }
        });
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "An error occurred during login" 
    });
  }
}

// Handle user registration
async function register(req, res) {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await db.getUserByUsername(username);

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "Username already exists" 
      });
    }

    // For production, hash password before storing
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user (replace password with hashedPassword in production)
    const user = await db.createUser({
      username,
      email,
      password, // Use hashedPassword in production
      profilePicture: "",
      bio: "",
    });

    // Create JWT token
    const payload = {
      id: user._id.toString(),
      username: user.username
    };

    // Sign token
    jwt.sign(
      payload,
      req.app.get('jwtSecret'),
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token: `Bearer ${token}`,
          user: {
            id: user._id,
            username: user.username,
            email: user.email
          }
        });
      }
    );
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      success: false, 
      message: "An error occurred during registration" 
    });
  }
}

/* ---------------------------------------------------------------------------
    User Profile Handlers
  --------------------------------------------------------------------------- */
// Get user profile
async function getProfile(req, res) {
  try {
    const user = await db.getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Don't send password in response
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Profile retrieval error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to load profile" 
    });
  }
}

// Handle user profile update
async function updateProfile(req, res) {
  const { email, profilePicture, bio } = req.body;

  try {
    const updatedUser = await db.updateUser(req.user.id, {
      email,
      profilePicture,
      bio,
    });

    // Don't send password in response
    const { password, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile"
    });
  }
}

// Handle profile image upload
async function uploadProfileImage(req, res) {
  try {
    // Check if file exists in the request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided"
      });
    }

    // Read the file and convert to base64
    const fileBuffer = req.file.buffer;
    const base64Image = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;

    // Delete the temporary file since we don't need it anymore
    if (req.file.path) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: base64Image
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload image"
    });
  }
}

/* ---------------------------------------------------------------------------
    Question Handlers
  --------------------------------------------------------------------------- */
// Get all questions
async function getQuestions(req, res) {
  try {
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder || "desc";
    const tag = req.query.tag || null;
    const search = req.query.search || null;

    const questions = await db.getAllQuestions(sortBy, sortOrder, tag, search);

    // Get author details for each question
    for (const question of questions) {
      if (question.author) {
        const author = await db.getUserById(question.author);
        if (author) {
          // Replace the author ID with the full author object
          question.author = author;
        } else {
          question.author = { username: "Unknown" };
        }
      } else {
        question.author = { username: "Anonymous" };
      }
    }

    res.json({
      success: true,
      questions
    });
  } catch (error) {
    console.error("Questions list error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load questions"
    });
  }
}

// Get a specific question
async function getQuestion(req, res) {
  try {
    const questionId = req.params.id;
    const question = await db.getQuestionById(questionId);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }
    
    // Get author details and replace the author field with the full user object
    if (question.author) {
      const author = await db.getUserById(question.author);
      if (author) {
        // Replace the author ID with the full author object
        question.author = author;
      } else {
        question.author = { username: "Unknown" };
      }
    } else {
      question.author = { username: "Anonymous" };
    }
    
    // Get answers for this question
    const answers = await db.getAnswersByQuestion(questionId);
    
    // Get author details for each answer
    for (const answer of answers) {
      if (answer.author) {
        const author = await db.getUserById(answer.author);
        if (author) {
          // Replace the author ID with the full author object
          answer.author = author;
        } else {
          answer.author = { username: "Unknown" };
        }
      } else {
        answer.author = { username: "Anonymous" };
      }
    }
    
    res.json({
      success: true,
      question,
      answers
    });
  } catch (error) {
    console.error("Question retrieval error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load question"
    });
  }
}

// Add a new question
async function addQuestion(req, res) {
  const { title, body, tags } = req.body;

  // Simple validation
  if (!title || !body) {
    return res.status(400).json({
      success: false,
      message: "Title and body are required"
    });
  }

  try {
    // Process tags
    let processedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        // Split comma-separated string into array
        processedTags = tags.split(',').map(tag => tag.trim());
      } else if (Array.isArray(tags)) {
        processedTags = tags;
      }
    }

    // Use plain text for body instead of HTML
    const question = await db.createQuestion({
      title,
      body,
      author: req.user.id,
      tags: processedTags
    });

    res.status(201).json({
      success: true,
      question
    });
  } catch (error) {
    console.error("Question creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create question"
    });
  }
}

// Update a question
async function updateQuestion(req, res) {
  const questionId = req.params.id;
  
  try {
    const question = await db.getQuestionById(questionId);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }
    
    // Check if user is the author
    if (question.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this question"
      });
    }
    
    const { title, body, tags } = req.body;
    const updates = {};
    
    if (title) updates.title = title;
    if (body) updates.body = body;
    if (tags) {
      // Process tags
      if (typeof tags === 'string') {
        updates.tags = tags.split(',').map(tag => tag.trim());
      } else if (Array.isArray(tags)) {
        updates.tags = tags;
      }
    }
    
    const updatedQuestion = await db.updateQuestion(questionId, updates);
    
    // Get author details and replace author field with full user object
    if (updatedQuestion.author) {
      const author = await db.getUserById(updatedQuestion.author);
      if (author) {
        updatedQuestion.author = author;
      } else {
        updatedQuestion.author = { username: "Unknown" };
      }
    } else {
      updatedQuestion.author = { username: "Anonymous" };
    }
    
    res.json({
      success: true,
      question: updatedQuestion
    });
  } catch (error) {
    console.error("Question update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update question"
    });
  }
}

// Delete a question
async function deleteQuestion(req, res) {
  const questionId = req.params.id;
  
  try {
    const question = await db.getQuestionById(questionId);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }
    
    // Check if user is the author
    if (question.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this question"
      });
    }
    
    await db.deleteQuestion(questionId);
    
    res.json({
      success: true,
      message: "Question deleted successfully"
    });
  } catch (error) {
    console.error("Question deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete question"
    });
  }
}

/* ---------------------------------------------------------------------------
    Answer Handlers
  --------------------------------------------------------------------------- */
// Add an answer to a question
async function addAnswer(req, res) {
  const { questionId, body } = req.body;
  
  // Simple validation
  if (!questionId || !body) {
    return res.status(400).json({
      success: false,
      message: "Question ID and answer body are required"
    });
  }
  
  try {
    // Check if question exists
    const question = await db.getQuestionById(questionId);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }
    
    // Use plain text for body instead of HTML
    const answer = await db.createAnswer({
      questionId,
      body,
      author: req.user.id
    });
    
    // Get author details and replace author field with full user object
    const author = await db.getUserById(req.user.id);
    if (author) {
      answer.author = author;
    } else {
      answer.author = { username: "Unknown" };
    }
    
    res.status(201).json({
      success: true,
      answer
    });
  } catch (error) {
    console.error("Answer creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create answer"
    });
  }
}

// Get answers for a specific question
async function getAnswersByQuestion(req, res) {
  try {
    const questionId = req.params.id;
    
    // Check if question exists
    const question = await db.getQuestionById(questionId);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }
    
    // Get answers for this question
    const answers = await db.getAnswersByQuestion(questionId);
    
    // Get author details for each answer
    for (const answer of answers) {
      if (answer.author) {
        const author = await db.getUserById(answer.author);
        if (author) {
          // Replace the author ID with the full author object
          answer.author = author;
        } else {
          answer.author = { username: "Unknown" };
        }
      } else {
        answer.author = { username: "Anonymous" };
      }
    }
    
    res.json({
      success: true,
      answers
    });
  } catch (error) {
    console.error("Answers retrieval error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load answers"
    });
  }
}

// Update an answer
async function updateAnswer(req, res) {
  const answerId = req.params.id;
  const { body } = req.body;
  
  if (!body) {
    return res.status(400).json({
      success: false,
      message: "Answer body is required"
    });
  }
  
  try {
    const answer = await db.getAnswerById(answerId);
    
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: "Answer not found"
      });
    }
    
    // Check if user is the author
    if (answer.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this answer"
      });
    }
    
    // Use plain text for body instead of HTML
    const updatedAnswer = await db.updateAnswer(answerId, { body });
    
    // Get author details and add to the response
    if (updatedAnswer.author) {
      const author = await db.getUserById(updatedAnswer.author);
      if (author) {
        updatedAnswer.author = author;
      } else {
        updatedAnswer.author = { username: "Unknown" };
      }
    } else {
      updatedAnswer.author = { username: "Anonymous" };
    }
    
    res.json({
      success: true,
      answer: updatedAnswer
    });
  } catch (error) {
    console.error("Answer update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update answer"
    });
  }
}

// Delete an answer
async function deleteAnswer(req, res) {
  const answerId = req.params.id;
  
  try {
    const answer = await db.getAnswerById(answerId);
    
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: "Answer not found"
      });
    }
    
    // Check if user is the author
    if (answer.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this answer"
      });
    }
    
    await db.deleteAnswer(answerId);
    
    res.json({
      success: true,
      message: "Answer deleted successfully"
    });
  } catch (error) {
    console.error("Answer deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete answer"
    });
  }
}

/* ---------------------------------------------------------------------------
    Voting Handlers
  --------------------------------------------------------------------------- */
// Handle upvote/downvote on a question
async function voteQuestion(req, res) {
  const { id } = req.params;
  const { voteType } = req.body; // 'upvote' or 'downvote'

  try {
    let question;
    
    if (voteType === 'up') {
      question = await db.toggleUpvoteQuestion(id, req.user.id);
    } else if (voteType === 'down') {
      question = await db.toggleDownvoteQuestion(id, req.user.id);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid vote type"
      });
    }
    
    // Get author details and replace author field with full user object
    if (question.author) {
      const author = await db.getUserById(question.author);
      if (author) {
        question.author = author;
      } else {
        question.author = { username: "Unknown" };
      }
    } else {
      question.author = { username: "Anonymous" };
    }
    
    res.json({
      success: true,
      question
    });
  } catch (error) {
    console.error("Question voting error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process vote"
    });
  }
}

// Handle upvote/downvote on an answer
async function voteAnswer(req, res) {
  const { id } = req.params;
  const { voteType } = req.body; // 'upvote' or 'downvote'

  try {
    let answer;
    
    if (voteType === 'up') {
      answer = await db.toggleUpvoteAnswer(id, req.user.id);
    } else if (voteType === 'down') {
      answer = await db.toggleDownvoteAnswer(id, req.user.id);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid vote type"
      });
    }
    
    // Get author details and replace author field with full user object
    if (answer.author) {
      const author = await db.getUserById(answer.author);
      if (author) {
        answer.author = author;
      } else {
        answer.author = { username: "Unknown" };
      }
    } else {
      answer.author = { username: "Anonymous" };
    }
    
    res.json({
      success: true,
      answer
    });
  } catch (error) {
    console.error("Answer voting error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process vote"
    });
  }
}

module.exports = {
  // Auth handlers
  login,
  register,
  
  // User profile handlers
  getProfile,
  updateProfile,
  uploadProfileImage,
  
  // Question handlers
  getQuestions,
  getQuestion,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  
  // Answer handlers
  addAnswer,
  getAnswersByQuestion,
  updateAnswer,
  deleteAnswer,
  
  // Voting handlers
  voteQuestion,
  voteAnswer
}; 