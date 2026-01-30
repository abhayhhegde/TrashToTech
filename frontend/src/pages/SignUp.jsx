import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link here

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; // Base URL of the backend API

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    // Basic password match validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/register`, {
        username,
        password,
        email,
        phone,
      });

      if (response.status === 201) {
        // Redirect to login after successful signup
        navigate('/login');
      }
    } catch (err) {
      // Handle error and display error message
      setError('Signup failed. Please check your details and try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md mt-20 mb-5">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">Sign Up</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="w-full p-2 border border-gray-700 rounded bg-gray-700 text-white placeholder-gray-400"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="w-full p-2 border border-gray-700 rounded bg-gray-700 text-white placeholder-gray-400"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              className="w-full p-2 border border-gray-700 rounded bg-gray-700 text-white placeholder-gray-400"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="w-full p-2 border border-gray-700 rounded bg-gray-700 text-white placeholder-gray-400"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 mb-2" htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              className="w-full p-2 border border-gray-700 rounded bg-gray-700 text-white placeholder-gray-400"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          >
            Sign Up
          </button>
          <p className="text-center text-gray-400 mt-4">Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link></p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
