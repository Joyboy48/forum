import React, { useState, useEffect } from 'react';
import { FiAlertCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { getPostSummary } from '../services/aiService';

const PostSummary = ({ postId, content, className = '' }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [isSummarized, setIsSummarized] = useState(false);

  useEffect(() => {
    // Only fetch summary if the component is expanded and not already loaded
    if (expanded && !isSummarized && postId) {
      fetchSummary();
    }
  }, [expanded, postId, isSummarized]);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const summaryText = await getPostSummary(postId);
      setSummary(summaryText);
      setIsSummarized(true);
    } catch (err) {
      console.error('Error fetching post summary:', err);
      setError('Failed to generate summary. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Only show the summary toggle if the post is long enough
  const wordCount = content ? content.split(/\s+/).length : 0;
  if (wordCount < 100) {
    return null;
  }

  return (
    <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={toggleExpand}
        className="w-full flex items-center justify-between p-3 text-left text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        aria-expanded={expanded}
      >
        <span>AI Summary</span>
        {expanded ? <FiChevronUp /> : <FiChevronDown />}
      </button>

      {expanded && (
        <div className="p-3 pt-0">
          {loading ? (
            <div className="text-sm text-blue-700 dark:text-blue-300">
              Generating summary...
            </div>
          ) : error ? (
            <div className="flex items-start text-sm text-red-600 dark:text-red-400">
              <FiAlertCircle className="flex-shrink-0 mr-1.5 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300">
                {summary || 'No summary available'}
              </p>
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                AI-generated summary. May contain inaccuracies.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostSummary;
