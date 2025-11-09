import axios from 'axios';

/**
 * API Service for the Learnato Forum
 * This module provides a configured axios instance and all API endpoints
 * 
 * The API_URL is determined by:
 * - In Docker: nginx proxies /api to the server, so use relative URL
 * - In local dev/production: use the full URL from environment variable
 */
const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('API Request:', {
    url: config.url,
    method: config.method,
    params: config.params,
    data: config.data,
    headers: config.headers
  });
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export const getPosts = (sort = 'date') => {
  return api.get(`/posts?sort=${sort}`);
};

export const getPost = (id) => {
  return api.get(`/posts/${id}`);
};

export const createPost = (postData) => {
  return api.post('/posts', postData);
};

export const addReply = (postId, replyData) => {
  return api.post(`/posts/${postId}/reply`, replyData);
};

export const upvotePost = (postId) => {
  return api.post(`/posts/${postId}/upvote`);
};

// Auth endpoints
export const signup = (userData) => {
  return api.post('/auth/signup', userData);
};

export const login = (credentials) => {
  return api.post('/auth/login', credentials);
};

export const getMe = () => {
  return api.get('/auth/me');
};

// Post actions
export const markAsAnswered = (postId) => {
  return api.post(`/posts/${postId}/mark-answered`);
};

// AI endpoints
export const getSimilarPosts = (postId) => {
  return api.get(`/ai/similar/${postId}`);
};

export const summarizeDiscussion = (postId) => {
  return api.get(`/ai/summarize/${postId}`);
};

// Export everything
export {
  getPosts,
  getPost,
  createPost,
  addReply,
  upvotePost,
  signup,
  login,
  getMe,
  markAsAnswered,
  getSimilarPosts,
  summarizeDiscussion,
};

// Export the api instance as default
export default api;

