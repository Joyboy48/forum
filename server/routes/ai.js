const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/auth');

// Apply optional auth to all routes
router.use(optionalAuth);

// Search and suggestions
router.get('/search-suggestions', aiController.getSearchSuggestions);
router.get('/similar', aiController.getSimilarQuestions);

// Post-related AI features
router.get('/similar/:postId', aiController.getSimilarPosts);
router.get('/summarize/:postId', aiController.summarizeDiscussion);
router.post('/smart-replies', aiController.getSmartReplies);
router.post('/analyze-content', aiController.analyzeContent);

module.exports = router;

