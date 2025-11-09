import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiX, FiChevronRight } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import AISearchSuggestions from './AISearchSuggestions';

const SearchBar = ({ onSearch, className = '', autoFocus = false, onFocusChange }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);

  // Auto-focus search on mobile when navigating to search results
  useEffect(() => {
    if (location.pathname === '/search' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [location.pathname]);

  // Handle search submission
  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    const searchQuery = query.trim();
    if (searchQuery) {
      onSearch?.(searchQuery);
      if (!location.pathname.startsWith('/search')) {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
    }
  }, [query, onSearch, location.pathname, navigate]);

  // Handle suggestion selection
  const handleSelectSuggestion = useCallback((suggestion) => {
    setQuery(suggestion);
    setTimeout(() => {
      handleSubmit();
    }, 0);
  }, [handleSubmit]);

  // Clear search and reset
  const clearSearch = () => {
    setQuery('');
    onSearch?.('');
    inputRef.current?.focus();
  };

  // Handle focus and blur for better mobile UX
  const handleFocus = () => {
    setIsFocused(true);
    onFocusChange?.(true);
  };

  const handleBlur = () => {
    // Use setTimeout to allow click events to process before hiding suggestions
    setTimeout(() => {
      setIsFocused(false);
      onFocusChange?.(false);
    }, 200);
  };

  return (
    <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <FiSearch className="absolute left-3 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Search posts, questions, and more..."
            className={`w-full py-2 pl-10 pr-10 rounded-full border ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-blue-500' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
            } focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-200`}
            autoComplete="off"
            autoFocus={autoFocus}
            aria-autocomplete="list"
            aria-controls="search-suggestions"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-10 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none transition-colors"
              aria-label="Clear search"
            >
              <FiX size={18} />
            </button>
          )}
          <button
            type="submit"
            className={`absolute right-2 p-1 rounded-full ${
              darkMode 
                ? 'text-blue-400 hover:text-blue-300' 
                : 'text-blue-500 hover:text-blue-600'
            } focus:outline-none transition-colors`}
            aria-label="Search"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
        
        {/* AI Search Suggestions */}
        {isFocused && query.length > 1 && (
          <div className="absolute z-10 w-full mt-1">
            <AISearchSuggestions 
              query={query} 
              onSelectSuggestion={handleSelectSuggestion} 
            />
          </div>
        )}
        
        {/* Clickable overlay for mobile - allows closing search by clicking outside */}
        {isFocused && (
          <div 
            className="fixed inset-0 bg-black/20 z-0 sm:hidden"
            onClick={handleBlur}
            aria-hidden="true"
          />
        )}
      </form>
    </div>
  );
};

export default SearchBar;
