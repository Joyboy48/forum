const mongoose = require('mongoose');
const Post = require('../models/Post');

// Search posts
exports.searchPosts = async (req, res) => {
  console.log('Search request received:', req.query);
  
  // Simple health check
  if (req.query.health === 'check') {
    return res.json({ status: 'ok', message: 'Search endpoint is healthy' });
  }
  
  const { q: searchTerm } = req.query;
  
  if (!searchTerm || !searchTerm.trim()) {
    console.log('Empty search term provided');
    return res.status(400).json({ error: 'Search term is required' });
  }
  
  console.log('Searching for:', searchTerm);
  
  try {
    const query = {
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { content: { $regex: searchTerm, $options: 'i' } },
        { author: { $regex: searchTerm, $options: 'i' } }
      ]
    };
    
    console.log('MongoDB Query:', JSON.stringify(query, null, 2));
    
    // Check if we're connected to MongoDB
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected');
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    // Execute the query
    const posts = await Post.find(query).sort({ createdAt: -1 }).lean();
    console.log(`Found ${posts.length} posts matching the query`);
    
    // Add hasUpvoted flag for logged-in users
    const postsWithUpvoteStatus = posts.map(post => {
      try {
        const postObj = { ...post };
        if (req.user && post.upvotedBy) {
          postObj.hasUpvoted = post.upvotedBy.some(
            id => id && req.user._id && id.toString() === req.user._id.toString()
          );
        } else {
          postObj.hasUpvoted = false;
        }
        return postObj;
      } catch (mapError) {
        console.error('Error processing post:', post._id, mapError);
        return { ...post, hasUpvoted: false };
      }
    });
    
    console.log('Sending response with', postsWithUpvoteStatus.length, 'posts');
    res.json(postsWithUpvoteStatus);
  } catch (error) {
    console.error('Error in searchPosts:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue
    });
    
    res.status(500).json({ 
      error: 'Error searching posts',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    console.log('getAllPosts called with query:', req.query);
    const { sort = 'date', search = '', q = '' } = req.query;
    const searchTerm = search || q; // Support both 'search' and 'q' parameters
    
    console.log('Sort:', sort, 'Search term:', searchTerm);
    
    // Set default sort options
    let sortOption = { createdAt: -1 };
    if (sort === 'votes') {
      sortOption = { votes: -1, createdAt: -1 };
    }
    
    // Build search query
    let query = {};
    if (searchTerm && searchTerm.trim()) {
      try {
        query = {
          $or: [
            { title: { $regex: searchTerm, $options: 'i' } },
            { content: { $regex: searchTerm, $options: 'i' } },
            { author: { $regex: searchTerm, $options: 'i' } }
          ]
        };
        console.log('Search query:', JSON.stringify(query, null, 2));
      } catch (error) {
        console.error('Error building search query:', error);
        return res.status(400).json({ error: 'Invalid search term' });
      }
    }
    
    // Execute query with error handling
    const posts = await Post.find(query).sort(sortOption).catch(err => {
      console.error('MongoDB query error:', err);
      throw new Error('Error querying posts from database');
    });
    
    console.log(`Found ${posts.length} posts matching the query`);
    
    // Add hasUpvoted flag for logged-in users
    const postsWithUpvoteStatus = posts.map(post => {
      try {
        const postObj = post.toObject();
        if (req.user && post.upvotedBy) {
          postObj.hasUpvoted = post.upvotedBy.some(
            id => id && req.user._id && id.toString() === req.user._id.toString()
          );
        } else {
          postObj.hasUpvoted = false;
        }
        return postObj;
      } catch (mapErr) {
        console.error('Error processing post:', post._id, mapErr);
        return null;
      }
    }).filter(Boolean); // Remove any null entries from mapping errors
    
    res.json(postsWithUpvoteStatus);
  } catch (error) {
    console.error('Error in getAllPosts:', {
      message: error.message,
      stack: error.stack,
      query: req.query,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({ 
      error: 'Failed to fetch posts',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single post
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Add hasUpvoted flag for logged-in users
    const postObj = post.toObject();
    if (req.user) {
      postObj.hasUpvoted = post.upvotedBy.some(
        id => id.toString() === req.user._id.toString()
      );
    } else {
      postObj.hasUpvoted = false;
    }
    
    res.json(postObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create post
exports.createPost = async (req, res) => {
  try {
    const { title, content, author } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    // Use authenticated user's username if available, otherwise use provided author or Anonymous
    const postAuthor = req.user ? req.user.username : (author || 'Anonymous');
    
    const post = new Post({
      title,
      content,
      author: postAuthor
    });
    
    const savedPost = await post.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('newPost', savedPost);
    }
    
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add reply to post
exports.addReply = async (req, res) => {
  try {
    const { content, author } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Reply content is required' });
    }
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Use authenticated user's username if available, otherwise use provided author or Anonymous
    const replyAuthor = req.user ? req.user.username : (author || 'Anonymous');
    
    post.replies.push({
      content,
      author: replyAuthor
    });
    post.updatedAt = Date.now();
    
    const updatedPost = await post.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('newReply', { postId: req.params.id, reply: updatedPost.replies[updatedPost.replies.length - 1] });
      io.emit('postUpdated', updatedPost);
    }
    
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upvote post
exports.upvotePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // If user is logged in, check if they've already upvoted
    if (req.user) {
      const userId = req.user._id.toString();
      const hasUpvoted = post.upvotedBy.some(id => id.toString() === userId);
      
      if (hasUpvoted) {
        return res.status(400).json({ error: 'You have already upvoted this post' });
      }
      
      // Add user to upvotedBy array
      post.upvotedBy.push(req.user._id);
      post.votes += 1;
    } else {
      // For anonymous users, we can't track, so allow upvote
      // In a real app, you might want to use IP or session tracking
      post.votes += 1;
    }
    
    const updatedPost = await post.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('postUpdated', updatedPost);
    }
    
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark post as answered
exports.markAsAnswered = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check if user is instructor or post author
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const isInstructor = req.user.role === 'instructor';
    const isAuthor = post.author === req.user.username;
    
    if (!isInstructor && !isAuthor) {
      return res.status(403).json({ error: 'Only instructors or post authors can mark as answered' });
    }
    
    post.isAnswered = !post.isAnswered; // Toggle
    if (post.isAnswered) {
      post.answeredBy = req.user.username;
      post.answeredAt = new Date();
    } else {
      post.answeredBy = null;
      post.answeredAt = null;
    }
    
    const updatedPost = await post.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('postUpdated', updatedPost);
    }
    
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

