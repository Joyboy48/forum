import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowUp, FaComment, FaUser, FaClock, FaCheckCircle } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const PostCard = ({ post, onUpvote }) => {
  const handleUpvote = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!post.hasUpvoted) {
      onUpvote(post._id);
    }
  };

  return (
    <Link to={`/post/${post._id}`} className="block h-full">
      <div className="h-full bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-primary/20 dark:hover:border-accent/50 group">
        <div className="flex flex-col sm:flex-row gap-4 h-full">
          {/* Upvote button - side on desktop, top on mobile */}
          <div className="flex justify-center sm:block sm:w-12 flex-shrink-0">
            <button
              onClick={handleUpvote}
              disabled={post.hasUpvoted}
              className={`flex flex-col sm:flex-col-reverse items-center justify-center w-full sm:w-12 h-10 sm:h-auto py-2 sm:py-3 rounded-xl transition-all duration-200 ${
                post.hasUpvoted
                  ? 'bg-primary/10 text-primary dark:bg-accent/20 dark:text-accent cursor-not-allowed'
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
              aria-label={post.hasUpvoted ? 'Already upvoted' : 'Upvote'}
            >
              <FaArrowUp 
                className={`text-lg transition-transform ${
                  post.hasUpvoted ? 'scale-125' : 'group-hover:scale-125'
                } ${post.hasUpvoted || post.upvotes > 0 ? 'text-primary dark:text-accent' : ''}`} 
              />
              <span className="text-sm font-medium mt-0.5 sm:mt-0 sm:mb-1">
                {post.upvotes || 0}
              </span>
            </button>
          </div>

          {/* Post content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-accent transition-colors line-clamp-2">
                {post.title}
              </h3>
              {post.isAnswered && (
                <div className="flex-shrink-0 flex items-center gap-1 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-lg text-xs font-medium">
                  <FaCheckCircle className="text-xs" />
                  <span>Answered</span>
                </div>
              )}
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
              {post.content}
            </p>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-2.5 py-1 rounded-lg">
                <FaUser className="text-xs flex-shrink-0" />
                <span className="truncate max-w-[100px] sm:max-w-[150px]">{post.author}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaClock className="text-xs flex-shrink-0" />
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-1.5 ml-auto">
                <FaComment className="text-xs flex-shrink-0" />
                <span>{post.replies?.length || 0} {post.replies?.length === 1 ? 'reply' : 'replies'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;

