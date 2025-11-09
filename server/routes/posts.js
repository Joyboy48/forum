const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { optionalAuth } = require('../middleware/auth');

// Apply optional auth to all routes (so we can get user info if logged in)
router.use(optionalAuth);

// Regular routes
router.get('/', postController.getAllPosts);
// Search route must come before the :id route to avoid conflict
router.get('/search', postController.searchPosts);

// Post ID-based routes
router.get('/:id', postController.getPostById);
router.post('/', postController.createPost);
router.post('/:id/reply', postController.addReply);
router.post('/:id/upvote', postController.upvotePost);
router.post('/:id/mark-answered', postController.markAsAnswered);

module.exports = router;

