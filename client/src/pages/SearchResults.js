import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { FaSearch, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import { api } from '../services/api';

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('q') || '';

  useEffect(() => {
    const searchPosts = async () => {
      if (!query || !query.trim()) {
        setResults([]);
        setError('Please enter a search term');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        console.log('Making search request with query:', query);
        
        // Use the api service to make the request to the posts endpoint with search query
        const response = await api.get('/posts', {
          params: { 
            search: query.trim(),
            sort: 'date'
          }
        });
        
        console.log('Search API Response:', response);
        
        if (response && response.data) {
          const posts = Array.isArray(response.data) ? response.data : [];
          setResults(posts);
          if (posts.length === 0) {
            setError('No results found for your search');
          }
        } else {
          console.error('Unexpected response format:', response);
          setResults([]);
          setError('No results found');
        }
      } catch (err) {
        console.error('Search error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          config: {
            url: err.config?.url,
            method: err.config?.method,
            headers: err.config?.headers
          }
        });
        
        // Check for specific error responses
        if (err.response?.data?.error) {
          setError(`Error: ${err.response.data.error}`);
        } else {
          setError('Failed to fetch search results. Please try again.');
        }
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      searchPosts();
    }, 300); // Add debounce to prevent excessive API calls

    return () => clearTimeout(timer);
  }, [query]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Go back"
            >
              <FaArrowLeft className="text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Searching for: <span className="text-primary dark:text-accent">"{query}"</span>
            </h1>
          </div>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Go back"
          >
            <FaArrowLeft className="text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Search Results for: <span className="text-primary dark:text-accent">"{query}"</span>
          </h1>
        </div>
        
        {error ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-6 rounded-lg mb-6">
            <div className="flex items-center">
              <FaSearch className="text-yellow-500 mr-3 text-xl" />
              <p className="text-yellow-700 dark:text-yellow-300">{error}</p>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              Found {results.length} {results.length === 1 ? 'result' : 'results'} for your search
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
