import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaComments, FaUser, FaSignOutAlt, FaMoon, FaSun, FaSearch, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
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
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center flex-1">
            <Link to="/" className="flex items-center space-x-3 group">
              <FaComments className="text-blue-600 dark:text-blue-400 text-2xl transition-transform group-hover:scale-110" />
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400 hidden sm:block">Learnato Forum</span>
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

            {/* Theme Toggle */}
            <ThemeToggle />

            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <FaUser className="w-5 h-5" />
                  <span className="hidden md:inline">{user.username}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 hidden group-hover:block border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

