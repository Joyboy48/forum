import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaComments, FaUser, FaSignOutAlt, FaMoon, FaSun, FaSearch, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SearchBar from './SearchBar';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSearch = (query) => {
    setShowMobileSearch(false);
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <nav className="bg-white dark:bg-background-dark border-b border-border-light dark:border-border-dark shadow-sm sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center flex-1">
            <Link to="/" className="flex items-center space-x-3 group">
              <FaComments className="text-primary text-2xl transition-transform group-hover:scale-110" />
              <span className="text-xl font-bold text-primary dark:text-text-light hidden sm:block font-sans">Learnato Forum</span>
            </Link>
          </div>

          {/* Mobile Search Bar */}
          <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${showMobileSearch ? 'max-h-20 py-4' : 'max-h-0 py-0'}`}>
            <div className="px-4">
              <SearchBar onSearch={handleSearch} className="w-full" />
            </div>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 justify-center px-6">
            <SearchBar onSearch={handleSearch} className="max-w-2xl w-full" />
          </div>

          {/* Navigation and User Controls */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-text-primary dark:text-text-light hover:text-primary dark:hover:text-accent transition-colors font-medium hidden sm:block text-sm uppercase tracking-wider"
            >
              Home
            </Link>
            
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden p-2 rounded-2xl hover:bg-background-light dark:hover:bg-gray-700 transition-colors"
              aria-label="Search"
            >
              {showMobileSearch ? (
                <FaTimes className="text-text-primary dark:text-text-light text-lg" />
              ) : (
                <FaSearch className="text-text-primary dark:text-text-light text-lg" />
              )}
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-2xl hover:bg-background-light dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <FaSun className="text-text-primary dark:text-text-light text-lg" />
              ) : (
                <FaMoon className="text-text-primary dark:text-text-light text-lg" />
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center gap-2 text-text-primary dark:text-text-light">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <FaUser className="text-primary text-sm" />
                  </div>
                  <span className="font-medium text-sm">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-text-secondary dark:text-text-light hover:text-primary dark:hover:text-accent transition-colors font-medium text-sm"
                >
                  <FaSignOutAlt />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-primary text-white px-4 py-2 rounded-xl hover:bg-opacity-90 transition-all font-medium text-sm sm:text-base shadow-md hover:shadow-lg"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

