import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const FacilityRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    contactInfo: '',
    operatingHours: '',
    acceptedItems: '',
    latitude: '',
    longitude: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Parse accepted items (comma-separated)
      const acceptedItemsArray = formData.acceptedItems
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      // Parse coordinates
      const lat = parseFloat(formData.latitude) || 0;
      const lng = parseFloat(formData.longitude) || 0;

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        address: formData.address,
        contactInfo: formData.contactInfo,
        operatingHours: formData.operatingHours,
        acceptedItems: acceptedItemsArray,
        coordinates: [lng, lat] // [lng, lat] format
      };

      const response = await axios.post(`${API_BASE_URL}/facility/register`, payload);

      if (response.status === 201) {
        setSuccess('Facility registered successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/facility/login');
        }, 2000);
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded mt-20">
        <h2 className="text-2xl font-bold text-center mb-6">Register Facility</h2>

        {error && <p className="text-red-500 text-center mb-4 p-3 bg-red-900 rounded">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4 p-3 bg-green-900 rounded">{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Facility Name */}
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Facility Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-700 rounded bg-gray-700 text-white"
                placeholder="E-Waste Recycling Center"
                required
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-700 rounded bg-gray-700 text-white"
                placeholder="facility@example.com"
                required
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border border-gray-700 rounded bg-gray-700 text-white"
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 border border-gray-700 rounded bg-gray-700 text-white"
                required
              />
            </div>
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-700 text-white"
              placeholder="Full facility address"
              rows="2"
            />
          </div>

          {/* Contact Info */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Contact Info</label>
            <input
              type="text"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-700 text-white"
              placeholder="Phone number or email"
            />
          </div>

          {/* Operating Hours */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Operating Hours</label>
            <input
              type="text"
              name="operatingHours"
              value={formData.operatingHours}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-700 text-white"
              placeholder="Mon-Fri: 9:00 AM - 6:00 PM"
            />
          </div>

          {/* Accepted Items */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Accepted Items (comma-separated)</label>
            <input
              type="text"
              name="acceptedItems"
              value={formData.acceptedItems}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-700 text-white"
              placeholder="Laptops, Smartphones, Tablets, Batteries"
            />
          </div>

          {/* Location Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-400 mb-2">Latitude</label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="w-full p-2 border border-gray-700 rounded bg-gray-700 text-white"
                placeholder="12.9716"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Longitude</label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="w-full p-2 border border-gray-700 rounded bg-gray-700 text-white"
                placeholder="77.5946"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Register Facility
            </button>
            <Link to="/facility/login" className="text-blue-500 hover:underline">
              Already have an account? Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacilityRegister;
