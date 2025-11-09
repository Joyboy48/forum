import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import SearchResults from './pages/SearchResults';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import AIAssistant from './components/AIAssistant';

// Main App Wrapper to handle AI Assistant state
const AppContent = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [currentPostContent, setCurrentPostContent] = useState('');
  
  // Extract post content when on a post detail page
  useEffect(() => {
    if (location.pathname.startsWith('/post/')) {
      // In a real app, we would fetch the post content here
      // For now, we'll just set a placeholder
      setCurrentPostContent('This is the content of the current post. Ask me anything about it!');
    } else {
      setCurrentPostContent('');
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-200 flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </main>
      
      {/* Show AI Assistant only when user is logged in and on a post detail page */}
      {user && currentPostContent && <AIAssistant postContent={currentPostContent} />}
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Learnato Forum. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <Router>
              <AppContent />
            </Router>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

