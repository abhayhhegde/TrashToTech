import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../api/http';

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Check token and fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      const token = sessionStorage.getItem('authToken');
      if (token) {
        try {
          const response = await API.get('/api/user/me');
          setIsLoggedIn(true);
          setUsername(response.data.username);
        } catch (err) {
          console.error('Failed to fetch user data:', err);
          // Token invalid or expired, clear it
          sessionStorage.removeItem('authToken');
          setIsLoggedIn(false);
          setUsername('');
        }
      } else {
        setIsLoggedIn(false);
        setUsername('');
      }
    };

    fetchUserData();
  }, [location]);

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
    sessionStorage.removeItem('authToken'); // Remove the token from storage
    setIsLoggedIn(false); // Update the login state
    setUsername('');
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <nav className={`fixed w-full bg-gray-800 shadow-lg p-4 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-white">TrashToTech</h1>
          <p className="text-sm text-gray-300 italic ml-2 mt-4">Recycle, Reward, Repeat</p>
        </div>
        <div className="flex space-x-6 items-center">
          <Link to="/" className={`transition-colors duration-300 ${location.pathname === '/' ? 'text-white font-bold' : 'text-gray-300 hover:text-white'}`}>Home</Link>
          <Link to="/dashboard" className={`transition-colors duration-300 ${location.pathname === '/dashboard' ? 'text-white font-bold border-b-2 border-green-500 pb-1' : 'text-gray-300 hover:text-white'}`}>Dashboard</Link>
          <Link to="/contact" className={`transition-colors duration-300 ${location.pathname === '/contact' ? 'text-white font-bold' : 'text-gray-300 hover:text-white'}`}>Contact</Link>
          <Link to="/about" className={`transition-colors duration-300 ${location.pathname === '/about' ? 'text-white font-bold' : 'text-gray-300 hover:text-white'}`}>About</Link>

          {/* Conditional Rendering based on login state */}
          {isLoggedIn ? (
            <div className="flex items-center space-x-3">
              <span className="text-green-400 font-semibold">Welcome, {username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded transition-colors duration-300"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-gray-300 hover:text-white transition-colors duration-300">Login/Signup</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
