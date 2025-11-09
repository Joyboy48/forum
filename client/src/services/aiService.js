import axios from 'axios';
import { api } from './api';

const AI_API_URL = '/api/ai';

/**
 * Get AI-powered search suggestions
 * @param {string} query - The search query
 * @returns {Promise<Array>} List of search suggestions
 */
export const getSearchSuggestions = async (query) => {
  try {
    const response = await api.get(`${AI_API_URL}/search-suggestions`, {
      params: { q: query }
    });
    return response.data.suggestions || [];
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return [];
  }
};

/**
 * Get smart reply suggestions for a post
 * @param {string} postId - The ID of the post
 * @param {string} context - Optional context for the reply
 * @returns {Promise<Array>} List of reply suggestions
 */
export const getSmartReplies = async (postId, context = '') => {
  try {
    const response = await api.post(`${AI_API_URL}/smart-replies`, {
      postId,
      context
    });
    return response.data.replies || [];
  } catch (error) {
    console.error('Error getting smart replies:', error);
    return [];
  }
};

/**
 * Get AI-generated summary for a post
 * @param {string} postId - The ID of the post to summarize
 * @returns {Promise<string>} AI-generated summary
 */
export const getPostSummary = async (postId) => {
  try {
    const response = await api.get(`${AI_API_URL}/summarize/${postId}`);
    return response.data.summary || '';
  } catch (error) {
    console.error('Error getting post summary:', error);
    return '';
  }
};

/**
 * Get similar questions based on a query
 * @param {string} query - The search query
 * @returns {Promise<Array>} List of similar questions
 */
export const getSimilarQuestions = async (query) => {
  try {
    const response = await api.get(`${AI_API_URL}/similar`, {
      params: { q: query }
    });
    return response.data.similarQuestions || [];
  } catch (error) {
    console.error('Error getting similar questions:', error);
    return [];
  }
};

/**
 * Analyze post content for quality and relevance
 * @param {string} content - The post content to analyze
 * @returns {Promise<Object>} Analysis results
 */
export const analyzePostContent = async (content) => {
  try {
    const response = await api.post(`${AI_API_URL}/analyze-content`, { content });
    return response.data.analysis || {};
  } catch (error) {
    console.error('Error analyzing post content:', error);
    return {};
  }
};

/**
 * Get AI-powered search results
 * @param {string} query - Search query
 * @returns {Promise<Array>} Search results
 */
export const semanticSearch = async (query) => {
  try {
    const response = await axios.get('/api/posts', {
      params: { 
        q: query,
        sort: 'date'
      }
    });
    return response.data || [];
  } catch (error) {
    console.error('Error in semantic search:', error);
    return [];
  }
};
