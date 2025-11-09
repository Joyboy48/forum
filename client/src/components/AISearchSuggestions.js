import React, { useState, useEffect } from 'react';
import { getSearchSuggestions } from '../services/aiService';

const AISearchSuggestions = ({ query, onSelectSuggestion }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query || query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const suggestions = await getSearchSuggestions(query);
        setSuggestions(suggestions);
      } catch (err) {
        console.error('Error fetching search suggestions:', err);
        setError('Failed to load suggestions');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300); // Debounce
    return () => clearTimeout(timer);
  }, [query]);

  if (loading) {
    return <div className="p-2 text-gray-500">Loading suggestions...</div>;
  }

  if (error) {
    return <div className="p-2 text-red-500">{error}</div>;
  }

  if (!suggestions.length) {
    return null;
  }

  return (
    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
      <ul className="py-1">
        {suggestions.map((suggestion, index) => (
          <li 
            key={index}
            className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
            onClick={() => onSelectSuggestion(suggestion)}
          >
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AISearchSuggestions;
