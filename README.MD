## Database: MongoDB

### Schema

#### User Document
```json
{
  "_id": "ObjectId('user_id')",
  "username": "username",
  "email": "user@example.com",
  "password": "hashed_password",
  "profilePicture": "base64_type",
  "bio": "This is a user bio.",
  "createdAt": "2025-03-19T05:41:46.138Z",
  "updatedAt": "2025-03-19T05:41:46.138Z"
}
```

#### Question Document
```json
{
  "_id": "ObjectId('question_id')",
  "title": "Question title",
  "body": "Detailed question content.",
  "tags": ["tag1", "tag2"],
  "createdAt": "2025-03-19T12:22:18.656Z",
  "updatedAt": "2025-03-19T12:22:18.656Z",
  "upvotes": [],
  "downvotes": [],
  "netVotes": 0
}
```

#### Answer Document
```json
{
  "_id": "ObjectId('answer_id')",
  "questionId": "ObjectId('question_id')",
  "author": "ObjectId('user_id')",
  "body": "This is an answer to the question.",
  "createdAt": "2025-03-22T12:03:18.912Z",
  "updatedAt": "2025-03-22T12:03:18.912Z",
  "upvotes": [],
  "downvotes": [],
  "netVotes": 0
}
```

The frontend development server will start on http://localhost:5173

## API Endpoints

### Authentication
- POST /api/auth/login - Login user
- POST /api/auth/register - Register new user

### Users
- GET /api/users/profile - Get current user profile
- PUT /api/users/profile - Update user profile

### Questions
- GET /api/questions - Get all questions
- GET /api/questions/:id - Get a specific question
- POST /api/questions - Create a new question
- PUT /api/questions/:id - Update a question
- DELETE /api/questions/:id - Delete a question
- POST /api/questions/:questionId/vote - Vote on a question

### Answers
- POST /api/answers - Create a new answer
- PUT /api/answers/:id - Update an answer
- DELETE /api/answers/:id - Delete an answer
- POST /api/answers/:answerId/vote - Vote on an answer

## Technology Stack

- **Frontend**: React, Vite, Axios
- **Backend**: Express.js, MongoDB
- **Authentication**: JWT (JSON Web Tokens) 
- **Libbrary Component**: MUI


More details about user capabilities: 
1. only logged in users can ask questions, reply to questions 
2. everyone can view 
3. only the original posters of questions and answers can edit and delete their questions / answers


There should be 6 main view pages: 
1. log in page
2. sign up page
3. view question list page
4. specific question page, where you can view answers as well. 
5. ask question page
6. view own profile page


// ... existing code ...
There should be 6 main view pages: 
1. log in page
2. sign up page
3. view question list page
4. specific question page, where you can view answers as well. 
5. ask question page
6. view own profile page


You are coding using react, so always remember to have good componenet design and adhere to abstraction

## Page Components & Frontend Design

### 1. Login Page
- **AuthForm** - Reusable form component (shared with signup)
- **LoginForm** - Form with email/username and password fields
- **SignupRedirectButton** - Link to signup page
- **ErrorAlert** - Display authentication errors

Design: Clean, minimal interface with centered form, prominent login button, and subtle branding.

### 2. Signup Page
- **AuthForm** - Reusable container
- **SignupForm** - Fields for username, email, password, confirmation
- **LoginRedirectButton** - Link back to login
- **SuccessAlert** - Registration confirmation

Design: Similar to login page with multi-step form if needed, clear validation feedback.

### 3. Question List Page
- **QuestionListContainer** - Main layout component
- **SearchBar** - Question search functionality
- **FilterControls** - Filter by tags, date, votes
- **QuestionCard** - Individual question summaries
- **TagChips** - Clickable tag elements
- **PaginationControls** - Navigate between pages
- **AskQuestionButton** - Prominent CTA for logged-in users

Design: Clean list view with card-based question previews, clear hierarchy, tag color system, and sorting controls.

### 4. Specific Question Page
- **QuestionDetail** - Full question with metadata
- **VotingControls** - Upvote/downvote UI
- **TagDisplay** - Visual tag representation
- **AnswerList** - Container for answers
- **AnswerCard** - Individual answer display
- **AnswerForm** - Rich text editor for new answers
- **EditDeleteControls** - For question/answer owners

Design: Focused reading experience with clear hierarchy between question and answers, intuitive voting controls.

### 5. Ask Question Page
- **QuestionFormContainer** - Form wrapper
- **TitleInput** - Question title field
- **RichTextEditor** - Body content editor with formatting

Design: Distraction-free writing environment with intuitive formatting tools and clear submission process.

### 6. Profile Page
- **ProfileHeader** - User info and picture
- **ProfileStats** - Activity metrics
- **EditProfileForm** - Update personal information
- **UserQuestionsList** - Questions asked by user

Design: Dashboard layout with personal information prominently displayed and tabbed sections for different content types.

### Common Components
- **Navbar** - Site navigation, auth status, search (should be dynamic based on wether user is signed in)
- **Footer** - Site links, legal, contact
- **LoadingSpinner** - Consistent loading state
- **ErrorBoundary** - Graceful error handling
- **ConfirmationDialog** - Verify user actions
- **ToastNotifications** - System feedback

Design will use MUI components with a custom theme that balances professionalism with engagement, responsive layouts for all devices, and accessibility considerations throughout.

