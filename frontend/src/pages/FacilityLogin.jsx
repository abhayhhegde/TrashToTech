import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const FacilityLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/facility/login`, { email, password });

      if (response.status === 200) {
        const { token, email, name, facilityId } = response.data;
        // Use sessionStorage - expires when browser closes
        sessionStorage.setItem('facilityToken', token);
        sessionStorage.setItem('facilityEmail', email);
        sessionStorage.setItem('facilityName', name);
        sessionStorage.setItem('facilityId', facilityId);

        // Redirect to facility confirm page
        navigate('/facility/confirm');
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Invalid credentials, please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">Facility Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="mb-4 p-3 bg-blue-900 rounded text-sm text-blue-200">
          <strong>Existing Facilities:</strong> Default password is <code className="bg-blue-800 px-2 py-1 rounded">admin123</code>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="email">Facility Email</label>
            <input
              type="email"
              id="email"
              className="w-full p-2 border border-gray-700 rounded bg-gray-700 text-white placeholder-gray-400"
              placeholder="Enter facility email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 mb-2" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="w-full p-2 border border-gray-700 rounded bg-gray-700 text-white placeholder-gray-400"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Login
            </button>
            <Link to="/facility/register" className="text-blue-500 hover:underline">Register Facility</Link>
          </div>
        </form>

        <div className="mt-4 text-center">
          <Link to="/login" className="text-gray-400 text-sm hover:underline">User Login</Link>
        </div>
      </div>
    </div>
  );
};

export default FacilityLogin;
