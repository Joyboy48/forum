import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { getPosts, createPost, upvotePost } from '../services/api';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import { FaPlus, FaSortAmountDown, FaFire, FaSearch, FaComments } from 'react-icons/fa';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  useEffect(() => {
    if (!socket) return;

    const handleNewPost = (newPost) => {
      setPosts((prev) => {
        // Check if post already exists to prevent duplicates
        const exists = prev.some(post => post._id === newPost._id);
        if (exists) return prev;
        return [newPost, ...prev];
      });
    };

    const handlePostUpdated = (updatedPost) => {
      setPosts((prev) =>
        prev.map((post) => (post._id === updatedPost._id ? updatedPost : post))
      );
    };

    socket.on('newPost', handleNewPost);
    socket.on('postUpdated', handlePostUpdated);

    return () => {
      socket.off('newPost', handleNewPost);
      socket.off('postUpdated', handlePostUpdated);
    };
  }, [socket]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await getPosts(sortBy, searchQuery);
      setPosts(response.data || []);
      setFilteredPosts(response.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
      setFilteredPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Update search query and fetch posts
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPosts();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, sortBy]);

  const handleCreatePost = async (postData) => {
    try {
      const response = await createPost(postData);
      // Don't add to state here - let the socket event handle it
      // This prevents duplicate posts when socket event fires
      // The socket event will add it automatically
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleUpvote = async (postId) => {
    try {
      const response = await upvotePost(postId);
      setPosts((prev) =>
        prev.map((post) => (post._id === postId ? response.data : post))
      );
    } catch (error) {
      console.error('Error upvoting post:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Discussions</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-medium transition-colors shadow-sm hover:shadow-md"
          >
            <FaPlus className="text-sm" />
            <span>New Post</span>
          </button>
        </div>
        
        {/* Search and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search discussions..."
              className="block w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search discussions"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('date')}
              className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                sortBy === 'date'
                  ? 'bg-primary/10 text-primary dark:bg-accent/20 dark:text-accent border-2 border-primary/20 dark:border-accent/30'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-700'
              }`}
              aria-label="Sort by newest"
            >
              <FaSortAmountDown className="text-sm" />
              <span className="hidden xs:inline">Newest</span>
            </button>
            <button
              onClick={() => setSortBy('votes')}
              className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                sortBy === 'votes'
                  ? 'bg-primary/10 text-primary dark:bg-accent/20 dark:text-accent border-2 border-primary/20 dark:border-accent/30'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-700'
              }`}
              aria-label="Sort by popular"
            >
              <FaFire className="text-sm" />
              <span className="hidden xs:inline">Popular</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-16 sm:py-24">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 dark:bg-accent/20 flex items-center justify-center mb-2">
              <FaComments className="text-primary dark:text-accent text-xl" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading discussions...</p>
          </div>
        </div>
      ) : filteredPosts.length > 0 ? (
        /* Posts Grid */
        <div className="grid gap-4 sm:gap-5">
          {filteredPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onUpvote={handleUpvote}
              className="w-full"
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 dark:bg-accent/20 flex items-center justify-center mb-4">
            <FaComments className="text-primary dark:text-accent text-2xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {searchQuery ? 'No matching discussions' : 'No discussions yet'}
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {searchQuery
              ? 'Try adjusting your search or filter to find what you\'re looking for.'
              : 'Be the first to start a discussion and engage with the community!'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-colors duration-200"
            >
              <FaPlus className="mr-2 -ml-1" />
              Create your first post
            </button>
          )}
        </div>
      )}

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
};

export default Home;

