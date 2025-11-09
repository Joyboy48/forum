import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const Layout = ({ children }) => {
  const { darkMode } = useTheme();

  // Apply dark mode class to the root HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-gray-900');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-gray-900');
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-white text-gray-900'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </div>
  );
};

export default Layout;
