import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check token to determine if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true); // User is logged in
    }
  }, []);

  // Function to handle the scroll behavior
  const handleScroll = () => {
    const currentScrollPos = window.pageYOffset;
    const isScrollingUp = prevScrollPos > currentScrollPos;

    setIsVisible(isScrollingUp || currentScrollPos < 10); // Keep visible at the top
    setPrevScrollPos(currentScrollPos);
  };

  // Attach the scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [prevScrollPos]);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Remove the token from storage
    setIsLoggedIn(false); // Update the login state
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <nav className={`fixed w-full bg-gray-800 shadow-lg p-4 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-white">Trash to Tech</h1>
          <p className="text-sm text-gray-300 italic ml-2 mt-4">Recycle, Reward, Repeat</p>
        </div>
        <div className="flex space-x-6">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors duration-300">Home</Link>
          <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors duration-300">Dashboard</Link>
          <Link to="/contact" className="text-gray-300 hover:text-white transition-colors duration-300">Contact</Link>
          <Link to="/about" className="text-gray-300 hover:text-white transition-colors duration-300">About</Link>
          
          {/* Conditional Rendering based on login state */}
          {isLoggedIn ? (
            <button 
              onClick={handleLogout} 
              className="text-gray-300 hover:text-white transition-colors duration-300"
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="text-gray-300 hover:text-white transition-colors duration-300">Login/Signup</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
