import React, { useState } from 'react';
import API from '../api/http';
import { useNavigate, Link } from 'react-router-dom';

const FacilityLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // FIX: Changed from '/auth/login' to '/facility/login' to match server.js
      const res = await API.post('/facility/login', formData);
      
      // Store Token & Facility Info
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('facilityName', res.data.name);
      localStorage.setItem('userType', 'facility'); // Critical for separating User vs Facility logic

      // Redirect to the Facility Dashboard
      navigate('/facility-dashboard'); 
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Login failed. Please check credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md border-t-4 border-green-500">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Facility Access</h2>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4 text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Email</label>
            <input 
              type="email" 
              className="w-full p-3 bg-gray-700 rounded text-white border border-gray-600 focus:border-green-500 outline-none" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              required 
            />
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Password</label>
            <input 
              type="password" 
              className="w-full p-3 bg-gray-700 rounded text-white border border-gray-600 focus:border-green-500 outline-none" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              required 
            />
          </div>

          <button 
            disabled={loading}
            className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Logging in...' : 'Login to Console'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/facility/register" className="text-sm text-green-400 hover:underline">
            Register New Facility
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FacilityLogin;