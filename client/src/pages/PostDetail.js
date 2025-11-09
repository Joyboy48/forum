import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { getPost, addReply, upvotePost } from '../services/api';
import ReplyCard from '../components/ReplyCard';
import { FaArrowUp, FaArrowLeft, FaUser, FaClock, FaComment, FaCheckCircle, FaRobot, FaLightbulb, FaSpinner } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { markAsAnswered, getSimilarPosts } from '../services/api';
import SmartReply from '../components/SmartReply';
import PostSummary from '../components/PostSummary';
import { getPostSummary } from '../services/aiService';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [similarPosts, setSimilarPosts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    fetchPost();
    fetchAIData();
  }, [id]);

  const fetchAIData = async () => {
    if (!id) return;
    setLoadingAI(true);
    try {
      const [similarResponse, summaryResponse] = await Promise.all([
        getSimilarPosts(id).catch(() => ({ data: { similarPosts: [] } })),
        getPostSummary(id).then(summary => ({ data: { summary } })).catch(() => ({ data: { summary: null } }))
      ]);
      setSimilarPosts(similarResponse.data?.similarPosts || []);
      setSummary(summaryResponse.data?.summary || null);
    } catch (error) {
      console.error('Error fetching AI data:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('newReply', ({ postId, reply }) => {
      if (postId === id) {
        setPost((prev) => ({
          ...prev,
          replies: [...(prev.replies || []), reply]
        }));
      }
    });

    socket.on('postUpdated', (updatedPost) => {
      if (updatedPost._id === id) {
        setPost(updatedPost);
        // Refresh AI data when post is updated
        fetchAIData();
      }
    });

    return () => {
      socket.off('newReply');
      socket.off('postUpdated');
    };
  }, [socket, id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await getPost(id);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (post?.hasUpvoted) return;
    
    try {
      const response = await upvotePost(id);
      setPost(response.data);
    } catch (error) {
      console.error('Error upvoting post:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      }
    }
  };

  const handleMarkAsAnswered = async () => {
    try {
      const response = await markAsAnswered(id);
      setPost(response.data);
    } catch (error) {
      console.error('Error marking as answered:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      }
    }
  };

  const handleReplySubmit = async (e) => {
    e?.preventDefault();
    const content = replyContent.trim();
    const author = replyAuthor.trim() || (user?.username || 'Anonymous');
    
    if (!content) return;

    setSubmitting(true);
    try {
      const response = await addReply(id, { content, author });
      setPost(prev => ({
        ...prev,
        replies: [...prev.replies, response.data]
      }));
      setReplyContent('');
      setReplyAuthor('');
      setIsReplying(false);
    } catch (error) {
      console.error('Error adding reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectSmartReply = (reply) => {
    setReplyContent(reply);
    // Auto-focus the reply input if it exists
    const replyInput = document.getElementById('reply-content');
    if (replyInput) {
      replyInput.focus();
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20">
          <p className="text-text text-lg mb-4">Post not found</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-text dark:text-textLight hover:text-primary dark:hover:text-white mb-6 transition-colors font-medium"
      >
        <FaArrowLeft />
        <span>Back to Forum</span>
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md border border-gray-100 dark:border-gray-700 mb-6 animate-fade-in">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold text-primary dark:text-white">{post.title}</h1>
              {post.isAnswered && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900 dark:bg-opacity-30 px-3 py-1 rounded-lg text-sm font-medium">
                  <FaCheckCircle />
                  <span>Answered</span>
                </div>
              )}
            </div>
            <p className="text-text dark:text-textLight leading-relaxed whitespace-pre-wrap mb-6">{post.content}</p>
            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <FaUser className="text-xs" />
                <span className="font-medium">{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaClock className="text-xs" />
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaComment className="text-xs" />
                <span>{post.replies?.length || 0} replies</span>
              </div>
            </div>
            {(user?.role === 'instructor' || post.author === user?.username) && (
              <button
                onClick={handleMarkAsAnswered}
                className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium ${
                  post.isAnswered
                    ? 'bg-green-100 dark:bg-green-900 dark:bg-opacity-30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800'
                    : 'bg-gray-100 dark:bg-gray-700 text-text dark:text-textLight hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <FaCheckCircle />
                <span>{post.isAnswered ? 'Mark as Unanswered' : 'Mark as Answered'}</span>
              </button>
            )}
          </div>
          <button
            onClick={handleUpvote}
            disabled={post.hasUpvoted}
            className={`flex flex-col items-center justify-center rounded-xl p-4 min-w-[70px] transition-all duration-200 group ${
              post.hasUpvoted 
                ? 'bg-primary bg-opacity-10 dark:bg-white dark:bg-opacity-10 cursor-not-allowed' 
                : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <FaArrowUp className={`text-xl mb-2 transition-transform ${post.hasUpvoted ? 'scale-125' : 'group-hover:scale-125'} ${post.hasUpvoted || post.votes > 0 ? 'text-primary dark:text-white' : 'text-gray-400 dark:text-gray-500'}`} />
            <span className="text-lg font-semibold text-primary dark:text-white">{post.votes || 0}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">votes</span>
          </button>
        </div>
      </div>

      {/* AI Assistant Section */}
      {(summary || similarPosts.length > 0) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 dark:bg-opacity-30 rounded-2xl p-6 shadow-md border border-blue-100 dark:border-blue-800 mb-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <FaRobot className="text-primary dark:text-white text-xl" />
            <h2 className="text-xl font-semibold text-primary dark:text-white">AI Assistant</h2>
          </div>
          
          {summary && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <FaLightbulb className="text-amber-500 dark:text-amber-400" />
                <h3 className="font-semibold text-text dark:text-textLight">Discussion Summary</h3>
              </div>
              <p className="text-text dark:text-textLight mb-2">{summary.summary}</p>
              {summary.keyPoints && summary.keyPoints.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-text dark:text-textLight mb-2">Key Points:</p>
                  <ul className="space-y-1">
                    {summary.keyPoints.map((point, idx) => (
                      <li key={idx} className="text-sm text-text dark:text-textLight flex items-start gap-2">
                        <span className="text-primary dark:text-white">•</span>
                        <span><strong>{point.author}:</strong> {point.preview}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {similarPosts.length > 0 && (
            <div>
              <h3 className="font-semibold text-text dark:text-textLight mb-2">Similar Questions</h3>
              <div className="space-y-2">
                {similarPosts.map((similarPost) => (
                  <Link
                    key={similarPost._id}
                    to={`/post/${similarPost._id}`}
                    className="block p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all border border-gray-200 dark:border-gray-700"
                  >
                    <p className="font-medium text-primary dark:text-white text-sm">{similarPost.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      by {similarPost.author} • {similarPost.votes} votes
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700 mb-6 animate-fade-in">
        <h2 className="text-xl font-semibold text-primary dark:text-white mb-4">Add a Reply</h2>
        <form onSubmit={handleReplySubmit} className="space-y-4">
          <div>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent transition-all resize-none text-text dark:text-textLight placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Share your thoughts or answer..."
              required
            />
          </div>
          {!user && (
            <div>
              <input
                type="text"
                value={replyAuthor}
                onChange={(e) => setReplyAuthor(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent transition-all text-text dark:text-textLight placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Your name (optional, defaults to Anonymous)"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={submitting || !replyContent.trim()}
            className="bg-primary dark:bg-white text-white dark:text-dark px-6 py-3 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Posting...' : 'Post Reply'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-primary dark:text-white mb-4">
          Replies ({post.replies?.length || 0})
        </h2>
        {post.replies && post.replies.length > 0 ? (
          <div className="space-y-4">
            {post.replies.map((reply, index) => (
              <ReplyCard key={index} reply={reply} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <p className="text-text dark:text-textLight">No replies yet. Be the first to respond!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetail;

