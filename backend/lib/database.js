// 57GgLKAJQSykXRlQ
// mongodb+srv://kevinthlim:57GgLKAJQSykXRlQ@cluster0.78blq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

const { MongoClient, ObjectId } = require("mongodb");
let client = null;
let db = null;

// Collections
let collectionUsers = null;
let collectionQuestions = null;
let collectionAnswers = null;

// Function to connect to db and get the collection object
async function initDBIfNecessary() {
  if (!client) {
    // Only connect to the database if we are not already connected
    console.log("Connecting to database");
    client = await MongoClient.connect(
      "mongodb://localhost:27017"
    );
    console.log("Connected to database");
    const db = client.db("qna-forum");
    collectionUsers = db.collection("users");
    collectionQuestions = db.collection("questions");
    collectionAnswers = db.collection("answers");
  }
} // end initDBIfNecessary

async function disconnect() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    collectionUsers = null;
    collectionQuestions = null;
    collectionAnswers = null;
  }
}

/* ---------------------------------------------------------------------------
    USER Management
  --------------------------------------------------------------------------- */
async function createUser(user) {
  console.log("trying to create user");
  await initDBIfNecessary();
  console.log("Creating user", user);
  user.createdAt = new Date();
  user.updatedAt = new Date();
  const result = await collectionUsers.insertOne(user);
  user._id = result.insertedId;
  return user;
}

async function getUserById(userId) {
  await initDBIfNecessary();
  return await collectionUsers.findOne({
    _id: ObjectId.createFromHexString(userId),
  });
}

async function getUserByUsername(username) {
  await initDBIfNecessary();
  return await collectionUsers.findOne({ username: username });
}

async function updateUser(userId, updatedFields) {
  await initDBIfNecessary();
  updatedFields.updatedAt = new Date();
  await collectionUsers.updateOne(
    {
      _id: ObjectId.createFromHexString(userId),
    },
    { $set: updatedFields }
  );
  return getUserById(userId);
}

async function getAllUsers() {
  await initDBIfNecessary();
  return await collectionUsers.find().toArray();
}

// Update user profile information
async function updateUserProfile(userId, updateData) {
  await initDBIfNecessary();

  const { email, profilePicture, bio } = updateData;

  await collectionUsers.updateOne(
    { _id: ObjectId.createFromHexString(userId) },
    {
      $set: {
        email,
        profilePicture,
        bio,
        updatedAt: new Date(),
      },
    }
  );

  return await getUserById(userId);
}

/* ---------------------------------------------------------------------------
    QUESTION Management
  --------------------------------------------------------------------------- */
async function createQuestion(question) {
  await initDBIfNecessary();
  question.createdAt = new Date();
  question.updatedAt = new Date();
  question.upvotes = [];
  question.downvotes = [];
  question.netVotes = 0; // Initialize netVotes to 0
  const result = await collectionQuestions.insertOne(question);
  question._id = result.insertedId;
  return question;
}

async function getQuestionById(questionId) {
  await initDBIfNecessary();
  return await collectionQuestions.findOne({
    _id: ObjectId.createFromHexString(questionId),
  });
}

async function getAllQuestions(
  sortBy = "createdAt",
  sortOrder = "desc",
  tag = null,
  search = null
) {
  await initDBIfNecessary();
  let query = {};

  if (tag) {
    query.tags = tag;
  }

  // Add search functionality
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { body: { $regex: search, $options: 'i' } }
    ];
  }

  let sortQuery = {};
  switch (sortBy) {
    case "netVotes":
      sortQuery.netVotes = sortOrder === "asc" ? 1 : -1;
      break;
    case "createdAt":
    default:
      sortQuery.createdAt = sortOrder === "asc" ? 1 : -1;
      break;
  }

  return await collectionQuestions.find(query).sort(sortQuery).toArray();
}

async function updateQuestion(questionId, updatedFields) {
  await initDBIfNecessary();
  updatedFields.updatedAt = new Date();
  await collectionQuestions.updateOne(
    { _id: ObjectId.createFromHexString(questionId) },
    { $set: updatedFields }
  );
  return getQuestionById(questionId);
}

async function deleteQuestion(questionId) {
  await initDBIfNecessary();
  await collectionQuestions.deleteOne({
    _id: ObjectId.createFromHexString(questionId),
  });
  // Optionally, also delete answers associated with this question
  await collectionAnswers.deleteMany({
    questionId: ObjectId.createFromHexString(questionId),
  });
  return true;
}

async function getQuestionsByTag(tag) {
  await initDBIfNecessary();
  return await collectionQuestions.find({ tags: tag }).toArray();
}

async function getQuestionsByUser(userId) {
  await initDBIfNecessary();
  return await collectionQuestions.find({ author: userId }).toArray();
}

/* ---------------------------------------------------------------------------
    ANSWER Management
  --------------------------------------------------------------------------- */
async function createAnswer(answer) {
  await initDBIfNecessary();
  answer.createdAt = new Date();
  answer.updatedAt = new Date();
  answer.upvotes = [];
  answer.downvotes = [];
  answer.netVotes = 0; // Initialize netVotes to 0
  const result = await collectionAnswers.insertOne(answer);
  answer._id = result.insertedId;
  return answer;
}

async function getAnswersByQuestion(questionId) {
  await initDBIfNecessary();
  console.log("questionId", questionId);
  console.log("collectionAnswers", await collectionAnswers.find().toArray());
  console.log("answers", await collectionAnswers.find({ questionId: ObjectId.createFromHexString(questionId) }).toArray());
  return await collectionAnswers
    .find({ questionId: questionId })
    .sort({ createdAt: 1 })
    .toArray();
}

async function updateAnswer(answerId, updatedFields) {
  await initDBIfNecessary();
  updatedFields.updatedAt = new Date();
  await collectionAnswers.updateOne(
    { _id: ObjectId.createFromHexString(answerId) },
    { $set: updatedFields }
  );
  return getAnswerById(answerId);
}

async function getAnswerById(answerId) {
  await initDBIfNecessary();
  return await collectionAnswers.findOne({
    _id: ObjectId.createFromHexString(answerId),
  });
}

async function deleteAnswer(answerId) {
  await initDBIfNecessary();
  await collectionAnswers.deleteOne({
    _id: ObjectId.createFromHexString(answerId),
  });
  return true;
}

async function getAnswersByUser(userId) {
  await initDBIfNecessary();
  return await collectionAnswers.find({ author: userId }).toArray();
}

/* ---------------------------------------------------------------------------
    VOTING Functions
      - Basic approach: upvotes/downvotes are arrays of user IDs
  --------------------------------------------------------------------------- */
// Toggle upvote on a question
async function toggleUpvoteQuestion(questionId, userId) {
  await initDBIfNecessary();
  const question = await getQuestionById(questionId);
  const userObjectId = ObjectId.createFromHexString(userId);

  // Remove user from downvotes if present
  const downvoteIndex = question.downvotes.findIndex((id) =>
    id.equals(userObjectId)
  );
  if (downvoteIndex !== -1) {
    question.downvotes.splice(downvoteIndex, 1);
    question.netVotes += 1;
  }

  // Add user to upvotes if not present, remove if present
  const upvoteIndex = question.upvotes.findIndex((id) =>
    id.equals(userObjectId)
  );
  if (upvoteIndex !== -1) {
    question.upvotes.splice(upvoteIndex, 1);
    question.netVotes -= 1;
  } else {
    question.upvotes.push(userObjectId);
    question.netVotes += 1;
  }

  await collectionQuestions.updateOne(
    { _id: ObjectId.createFromHexString(questionId) },
    {
      $set: {
        upvotes: question.upvotes,
        downvotes: question.downvotes,
        netVotes: question.netVotes,
      },
    }
  );

  return getQuestionById(questionId);
}

// Toggle downvote on a question
async function toggleDownvoteQuestion(questionId, userId) {
  await initDBIfNecessary();
  const question = await getQuestionById(questionId);
  const userObjectId = ObjectId.createFromHexString(userId);

  // Remove user from upvotes if present
  const upvoteIndex = question.upvotes.findIndex((id) =>
    id.equals(userObjectId)
  );
  if (upvoteIndex !== -1) {
    question.upvotes.splice(upvoteIndex, 1);
    question.netVotes -= 1;
  }

  // Add user to downvotes if not present, remove if present
  const downvoteIndex = question.downvotes.findIndex((id) =>
    id.equals(userObjectId)
  );
  if (downvoteIndex !== -1) {
    question.downvotes.splice(downvoteIndex, 1);
    question.netVotes += 1;
  } else {
    question.downvotes.push(userObjectId);
    question.netVotes -= 1;
  }

  await collectionQuestions.updateOne(
    { _id: ObjectId.createFromHexString(questionId) },
    {
      $set: {
        upvotes: question.upvotes,
        downvotes: question.downvotes,
        netVotes: question.netVotes,
      },
    }
  );

  return getQuestionById(questionId);
}

// Toggle upvote on an answer
async function toggleUpvoteAnswer(answerId, userId) {
  await initDBIfNecessary();
  const answer = await getAnswerById(answerId);
  const userObjectId = ObjectId.createFromHexString(userId);

  // Remove user from downvotes if present
  const downvoteIndex = answer.downvotes.findIndex((id) =>
    id.equals(userObjectId)
  );
  if (downvoteIndex !== -1) {
    answer.downvotes.splice(downvoteIndex, 1);
    answer.netVotes += 1;
  }

  // Add user to upvotes if not present, remove if present
  const upvoteIndex = answer.upvotes.findIndex((id) => id.equals(userObjectId));
  if (upvoteIndex !== -1) {
    answer.upvotes.splice(upvoteIndex, 1);
    answer.netVotes -= 1;
  } else {
    answer.upvotes.push(userObjectId);
    answer.netVotes += 1;
  }

  await collectionAnswers.updateOne(
    { _id: ObjectId.createFromHexString(answerId) },
    {
      $set: {
        upvotes: answer.upvotes,
        downvotes: answer.downvotes,
        netVotes: answer.netVotes,
      },
    }
  );

  return getAnswerById(answerId);
}

// Toggle downvote on an answer
async function toggleDownvoteAnswer(answerId, userId) {
  await initDBIfNecessary();
  const answer = await getAnswerById(answerId);
  const userObjectId = ObjectId.createFromHexString(userId);

  // Remove user from upvotes if present
  const upvoteIndex = answer.upvotes.findIndex((id) => id.equals(userObjectId));
  if (upvoteIndex !== -1) {
    answer.upvotes.splice(upvoteIndex, 1);
    answer.netVotes -= 1;
  }

  // Add user to downvotes if not present, remove if present
  const downvoteIndex = answer.downvotes.findIndex((id) =>
    id.equals(userObjectId)
  );
  if (downvoteIndex !== -1) {
    answer.downvotes.splice(downvoteIndex, 1);
    answer.netVotes += 1;
  } else {
    answer.downvotes.push(userObjectId);
    answer.netVotes -= 1;
  }

  await collectionAnswers.updateOne(
    { _id: ObjectId.createFromHexString(answerId) },
    {
      $set: {
        upvotes: answer.upvotes,
        downvotes: answer.downvotes,
        netVotes: answer.netVotes,
      },
    }
  );

  return getAnswerById(answerId);
}

/* ---------------------------------------------------------------------------
    MODULE EXPORTS
  --------------------------------------------------------------------------- */
module.exports = {
  initDBIfNecessary,
  disconnect,

  // Users
  createUser,
  getUserById,
  getUserByUsername,
  updateUser,
  getAllUsers,
  updateUserProfile,

  // Questions
  createQuestion,
  getQuestionById,
  getAllQuestions,
  updateQuestion,
  deleteQuestion,
  getQuestionsByTag,
  getQuestionsByUser,

  // Answers
  createAnswer,
  getAnswersByQuestion,
  updateAnswer,
  getAnswerById,
  deleteAnswer,
  getAnswersByUser,

  // Voting
  toggleUpvoteQuestion,
  toggleDownvoteQuestion,
  toggleUpvoteAnswer,
  toggleDownvoteAnswer,
};
