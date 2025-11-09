import React, { useState, useEffect } from 'react';
import { FiMessageSquare } from 'react-icons/fi';
import { getSmartReplies } from '../services/aiService';

const SmartReply = ({ postId, onSelectReply, className = '' }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!showSuggestions || !postId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const replies = await getSmartReplies(postId);
        setSuggestions(replies);
      } catch (err) {
        console.error('Error fetching smart replies:', err);
        setError('Failed to load reply suggestions');
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [postId, showSuggestions]);

  const toggleSuggestions = () => {
    setShowSuggestions(!showSuggestions);
  };

  const handleSelect = (reply) => {
    onSelectReply(reply);
    setShowSuggestions(false);
  };

  if (error) {
    return null; // Don't show anything if there's an error
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={toggleSuggestions}
        className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded-full ${
          showSuggestions 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
            : 'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
        } transition-colors`}
        aria-label="Show reply suggestions"
        aria-expanded={showSuggestions}
      >
        <FiMessageSquare className="mr-1" />
        <span>Smart Reply</span>
      </button>

      {showSuggestions && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Suggested Replies</h3>
          </div>
          
          {loading ? (
            <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
              Generating suggestions...
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <button
                    type="button"
                    onClick={() => handleSelect(suggestion)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
              No suggestions available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartReply;
