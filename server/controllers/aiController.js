const Post = require('../models/Post');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Cache for storing AI responses
const aiCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes TTL

// AI System Prompts
const AI_PROMPTS = {
  SEARCH_SUGGESTIONS: `Generate 5 search suggestions based on the following query. Keep them concise (2-5 words each) and relevant to a Q&A forum. Return as a JSON array of strings.`,
  SMART_REPLIES: `Generate 3 possible helpful and concise replies to the following post. Keep them under 20 words each. Return as a JSON array of strings.`,
  CONTENT_ANALYSIS: `Analyze the following post content and provide feedback in JSON format with these keys: 
  - clarity (1-5 rating)
  - detail (1-5 rating)
  - relevance (1-5 rating)
  - suggested_improvements (array of strings)
  - tags (array of relevant topic tags)
  - summary (brief summary in 1-2 sentences)
  
  Content to analyze:`
};

// Helper function to generate AI response
async function generateAIResponse(prompt, modelName = 'gemini-pro') {
  if (!genAI) {
    throw new Error('AI service is not configured');
  }

  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Helper function to get cached response
function getCachedResponse(key) {
  const cached = aiCache.get(key);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

// Helper function to cache response
function cacheResponse(key, data) {
  aiCache.set(key, {
    data,
    timestamp: Date.now()
  });
  return data;
}

/**
 * Get search suggestions based on a query
 */
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const cacheKey = `search_suggestions_${query}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return res.json({ suggestions: cached });
    }

    if (!genAI) {
      // Fallback to simple keyword-based suggestions
      const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      const suggestions = [
        ...new Set([
          ...keywords,
          ...keywords.map(k => `${k} tutorial`),
          ...keywords.map(k => `how to ${k}`),
          ...keywords.map(k => `${k} examples`),
          ...keywords.map(k => `best ${k} practices`)
        ])
      ].slice(0, 5);
      
      return res.json({ suggestions: cacheResponse(cacheKey, suggestions) });
    }

    try {
      const prompt = `${AI_PROMPTS.SEARCH_SUGGESTIONS}\n\nQuery: ${query}`;
      const response = await generateAIResponse(prompt);
      let suggestions = [];
      
      try {
        // Try to parse as JSON array first
        suggestions = JSON.parse(response);
      } catch (e) {
        // Fallback to splitting by newlines if not valid JSON
        suggestions = response
          .split('\n')
          .map(s => s.replace(/^\d+\.\s*|[-•]\s*|"/g, '').trim())
          .filter(s => s.length > 0);
      }
      
      res.json({ suggestions: cacheResponse(cacheKey, suggestions.slice(0, 5)) });
    } catch (error) {
      console.error('Error generating search suggestions:', error);
      res.status(500).json({ error: 'Failed to generate search suggestions' });
    }
  } catch (error) {
    console.error('Error in getSearchSuggestions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get smart reply suggestions for a post
 */
exports.getSmartReplies = async (req, res) => {
  try {
    const { postId, context = '' } = req.body;
    
    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    const post = await Post.findById(postId).select('content title');
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const cacheKey = `smart_replies_${postId}_${context}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return res.json({ replies: cached });
    }

    if (!genAI) {
      // Fallback to generic replies
      const replies = [
        'Thanks for sharing this!',
        'I have a similar question.',
        'Can you provide more details?'
      ];
      return res.json({ replies: cacheResponse(cacheKey, replies) });
    }

    try {
      const prompt = `${AI_PROMPTS.SMART_REPLIES}\n\nPost: ${post.title}\n${post.content}\n\nContext: ${context || 'No additional context provided'}`;
      const response = await generateAIResponse(prompt);
      
      let replies = [];
      try {
        // Try to parse as JSON array first
        replies = JSON.parse(response);
      } catch (e) {
        // Fallback to splitting by newlines if not valid JSON
        replies = response
          .split('\n')
          .map(s => s.replace(/^\d+\.\s*|[-•]\s*|"/g, '').trim())
          .filter(s => s.length > 0 && s.length < 100);
      }
      
      res.json({ replies: cacheResponse(cacheKey, replies.slice(0, 3)) });
    } catch (error) {
      console.error('Error generating smart replies:', error);
      res.status(500).json({ error: 'Failed to generate smart replies' });
    }
  } catch (error) {
    console.error('Error in getSmartReplies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Analyze post content for quality and relevance
 */
exports.analyzeContent = async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const cacheKey = `content_analysis_${content.substring(0, 100)}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return res.json({ analysis: cached });
    }

    if (!genAI) {
      // Fallback to simple analysis
      const wordCount = content.split(/\s+/).length;
      const analysis = {
        clarity: 3,
        detail: Math.min(5, Math.floor(wordCount / 50)),
        relevance: 3,
        suggested_improvements: [
          'Consider adding more specific details',
          'Break down complex ideas into smaller sections',
          'Add examples to illustrate your points'
        ],
        tags: [],
        summary: 'This is a summary of the content.'
      };
      return res.json({ analysis: cacheResponse(cacheKey, analysis) });
    }

    try {
      const prompt = `${AI_PROMPTS.CONTENT_ANALYSIS}\n\n${content}\n\nPlease provide the analysis in valid JSON format.`;
      const response = await generateAIResponse(prompt);
      
      try {
        // Try to parse the JSON response
        const analysis = JSON.parse(response);
        res.json({ analysis: cacheResponse(cacheKey, analysis) });
      } catch (e) {
        console.error('Error parsing AI response:', e);
        throw new Error('Invalid response format from AI');
      }
    } catch (error) {
      console.error('Error analyzing content:', error);
      res.status(500).json({ error: 'Failed to analyze content' });
    }
  } catch (error) {
    console.error('Error in analyzeContent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get similar posts based on content using Gemini AI
 */
exports.getSimilarPosts = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // If Gemini API is not configured, fall back to keyword-based search
    if (!genAI) {
      const keywords = post.title.toLowerCase().split(/\s+/).filter(word => word.length > 3);
      
      if (keywords.length === 0) {
        return res.json({ similarPosts: [] });
      }
      
      const similarPosts = await Post.find({
        _id: { $ne: postId },
        $or: [
          { title: { $regex: keywords.join('|'), $options: 'i' } },
          { content: { $regex: keywords.join('|'), $options: 'i' } }
        ]
      })
      .limit(5)
      .select('title author votes createdAt')
      .sort({ votes: -1, createdAt: -1 });
      
      return res.json({ similarPosts });
    }

    // Use Gemini AI to find similar posts
    try {
      // Get all posts except the current one
      const allPosts = await Post.find({ _id: { $ne: postId } })
        .select('_id title content author votes createdAt')
        .limit(50) // Limit to recent 50 posts for efficiency
        .sort({ createdAt: -1 });

      if (allPosts.length === 0) {
        return res.json({ similarPosts: [] });
      }

      // Create prompt for Gemini
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const postsData = allPosts.map(p => ({
        id: p._id.toString(),
        title: p.title,
        content: p.content.substring(0, 200) // Limit content length
      }));

      const prompt = `Given the following question/post, find the 5 most similar posts from the list below. Return only a JSON array of post IDs in order of similarity (most similar first).

Question/Post:
Title: ${post.title}
Content: ${post.content.substring(0, 500)}

Available Posts:
${JSON.stringify(postsData, null, 2)}

Return only a JSON array of IDs like: ["id1", "id2", "id3", "id4", "id5"]`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON array from response
      const jsonMatch = text.match(/\[.*?\]/s);
      let similarIds = [];
      
      if (jsonMatch) {
        try {
          similarIds = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error('Error parsing Gemini response:', e);
        }
      }

      // Map IDs to full post objects
      const similarPosts = similarIds
        .map(id => allPosts.find(p => p._id.toString() === id))
        .filter(Boolean)
        .slice(0, 5)
        .map(p => ({
          _id: p._id,
          title: p.title,
          author: p.author,
          votes: p.votes,
          createdAt: p.createdAt
        }));

      res.json({ similarPosts });
    } catch (aiError) {
      console.error('Gemini AI error:', aiError);
      // Fallback to keyword-based search
      const keywords = post.title.toLowerCase().split(/\s+/).filter(word => word.length > 3);
      
      if (keywords.length === 0) {
        return res.json({ similarPosts: [] });
      }
      
      const similarPosts = await Post.find({
        _id: { $ne: postId },
        $or: [
          { title: { $regex: keywords.join('|'), $options: 'i' } },
          { content: { $regex: keywords.join('|'), $options: 'i' } }
        ]
      })
      .limit(5)
      .select('title author votes createdAt')
      .sort({ votes: -1, createdAt: -1 });
      
      res.json({ similarPosts });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Summarize discussion using Gemini AI
exports.summarizeDiscussion = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // If Gemini API is not configured, return simple summary
    if (!genAI) {
      const summary = {
        title: post.title,
        author: post.author,
        totalReplies: post.replies.length,
        totalVotes: post.votes,
        isAnswered: post.isAnswered,
        keyPoints: [],
        summary: `This discussion has ${post.replies.length} ${post.replies.length === 1 ? 'reply' : 'replies'} and ${post.votes} ${post.votes === 1 ? 'vote' : 'votes'}. ${post.isAnswered ? 'The question has been marked as answered.' : 'The question is still open for discussion.'}`
      };
      
      if (post.replies.length > 0) {
        summary.keyPoints = post.replies.slice(0, 3).map(reply => ({
          author: reply.author,
          preview: reply.content.substring(0, 100) + (reply.content.length > 100 ? '...' : '')
        }));
      }
      
      return res.json({ summary });
    }

    // Use Gemini AI to generate summary
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      // Prepare discussion content
      const repliesText = post.replies.map((reply, idx) => 
        `Reply ${idx + 1} by ${reply.author}:\n${reply.content}`
      ).join('\n\n');

      const prompt = `Summarize the following discussion forum post and its replies. Provide:
1. A concise summary (2-3 sentences) of the main question and key points discussed
2. Extract 3-5 key points or insights from the replies

Post:
Title: ${post.title}
Author: ${post.author}
Content: ${post.content}
${post.replies.length > 0 ? `\nReplies:\n${repliesText}` : '\nNo replies yet.'}

Return your response in the following JSON format:
{
  "summary": "Brief summary text here",
  "keyPoints": [
    {
      "author": "author name",
      "point": "key point text"
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      let aiSummary = null;
      
      if (jsonMatch) {
        try {
          aiSummary = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error('Error parsing Gemini summary response:', e);
        }
      }

      // Format response
      const summary = {
        title: post.title,
        author: post.author,
        totalReplies: post.replies.length,
        totalVotes: post.votes,
        isAnswered: post.isAnswered,
        summary: aiSummary?.summary || `This discussion has ${post.replies.length} ${post.replies.length === 1 ? 'reply' : 'replies'} and ${post.votes} ${post.votes === 1 ? 'vote' : 'votes'}. ${post.isAnswered ? 'The question has been marked as answered.' : 'The question is still open for discussion.'}`,
        keyPoints: aiSummary?.keyPoints?.slice(0, 5).map(kp => ({
          author: kp.author || 'Anonymous',
          preview: kp.point || kp.preview || ''
        })) || (post.replies.length > 0 ? post.replies.slice(0, 3).map(reply => ({
          author: reply.author,
          preview: reply.content.substring(0, 100) + (reply.content.length > 100 ? '...' : '')
        })) : [])
      };

      res.json({ summary });
    } catch (aiError) {
      console.error('Gemini AI error:', aiError);
      // Fallback to simple summary
      const summary = {
        title: post.title,
        author: post.author,
        totalReplies: post.replies.length,
        totalVotes: post.votes,
        isAnswered: post.isAnswered,
        keyPoints: [],
        summary: `This discussion has ${post.replies.length} ${post.replies.length === 1 ? 'reply' : 'replies'} and ${post.votes} ${post.votes === 1 ? 'vote' : 'votes'}. ${post.isAnswered ? 'The question has been marked as answered.' : 'The question is still open for discussion.'}`
      };
      
      if (post.replies.length > 0) {
        summary.keyPoints = post.replies.slice(0, 3).map(reply => ({
          author: reply.author,
          preview: reply.content.substring(0, 100) + (reply.content.length > 100 ? '...' : '')
        }));
      }
      
      res.json({ summary });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
