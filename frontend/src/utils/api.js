import axios from 'axios';

// Authentication API calls
export const login = async (username, password) => {
  try {
    const response = await axios.post('/api/auth/login', { username, password });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post('/api/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await axios.get('/api/users/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const response = await axios.put('/api/users/profile', userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const uploadProfileImage = async (formData) => {
  try {
    const response = await axios.post('/api/users/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

// Question API calls
export const getQuestions = async (params = {}) => {
  try {
    const { sortBy, sortOrder, tag, search } = params;
    
    let queryParams = new URLSearchParams();
    
    if (sortBy) queryParams.append('sortBy', sortBy);
    if (sortOrder) queryParams.append('sortOrder', sortOrder);
    if (tag) queryParams.append('tag', tag);
    if (search) queryParams.append('search', search);
    
    const queryString = queryParams.toString();
    const url = `/api/questions${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

export const getQuestionById = async (questionId) => {
  try {
    const response = await axios.get(`/api/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching question:', error);
    throw error;
  }
};

export const createQuestion = async (questionData) => {
  try {
    const response = await axios.post('/api/questions', questionData);
    return response.data;
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
};

export const updateQuestion = async (questionId, questionData) => {
  try {
    const response = await axios.put(`/api/questions/${questionId}`, questionData);
    return response.data;
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

export const deleteQuestion = async (questionId) => {
  try {
    const response = await axios.delete(`/api/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

export const voteQuestion = async (questionId, voteType) => {
  try {
    const response = await axios.post(`/api/questions/${questionId}/vote`, { voteType });
    return response.data;
  } catch (error) {
    console.error('Error voting on question:', error);
    throw error;
  }
};

// Answer API calls
export const createAnswer = async (answerData) => {
  try {
    const response = await axios.post('/api/answers', answerData);
    return response.data;
  } catch (error) {
    console.error('Error creating answer:', error);
    throw error;
  }
};

export const getAnswersByQuestion = async (questionId) => {
  try {
    const response = await axios.get(`/api/answers/question/${questionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching answers for question:', error);
    throw error;
  }
};

export const updateAnswer = async (answerId, answerData) => {
  try {
    const response = await axios.put(`/api/answers/${answerId}`, answerData);
    return response.data;
  } catch (error) {
    console.error('Error updating answer:', error);
    throw error;
  }
};

export const deleteAnswer = async (answerId) => {
  try {
    const response = await axios.delete(`/api/answers/${answerId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting answer:', error);
    throw error;
  }
};

export const voteAnswer = async (answerId, voteType) => {
  try {
    const response = await axios.post(`/api/answers/${answerId}/vote`, { voteType });
    console.log("response", response);

    return response.data;
  } catch (error) {
    console.error('Error voting on answer:', error);
    throw error;
  }
};

// User API calls
export const getUserQuestions = async (userId) => {
  try {
    const response = await axios.get(`/api/users/${userId}/questions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user questions:', error);
    throw error;
  }
};

export const getUserAnswers = async (userId) => {
  try {
    const response = await axios.get(`/api/users/${userId}/answers`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user answers:', error);
    throw error;
  }
};