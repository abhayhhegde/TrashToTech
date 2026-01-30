import React, { useState } from 'react';
import API from '../api/http'; 
import { useNavigate } from 'react-router-dom';

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

    // 1. Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // 2. Format Data
      const acceptedItemsArray = formData.acceptedItems
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
      
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        address: formData.address,
        contactInfo: formData.contactInfo,
        operatingHours: formData.operatingHours || '9 AM - 6 PM',
        acceptedItems: acceptedItemsArray.length > 0 ? acceptedItemsArray : ['All E-Waste'],
        coordinates: [
            parseFloat(formData.longitude), 
            parseFloat(formData.latitude)
        ]
      };

      // 3. Send to CORRECT Endpoint (Public Registration)
      // Now: '/facility/register' (Correct - defined in server.js)
      const response = await API.post('/facility/register', payload);

      if (response.status === 201) {
        setSuccess('Facility registered successfully! Redirecting to login...');
        setTimeout(() => navigate('/facility/login'), 2000);
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Registration failed. Check your network.';
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 pt-24">
      <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded shadow-xl border border-gray-700">
        <h2 className="text-3xl font-bold text-center mb-6 text-green-400">Register Partner Facility</h2>

        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4 text-center">{error}</div>}
        {success && <div className="bg-green-900/50 border border-green-500 text-green-200 p-3 rounded mb-4 text-center">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Facility Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-green-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Manager Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-green-500 outline-none" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password *</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-green-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Confirm Password *</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-green-500 outline-none" required />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Full Address *</label>
            <textarea name="address" value={formData.address} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-green-500 outline-none" rows="2" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm text-gray-400 mb-1">Latitude (e.g. 12.97) *</label>
               <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-green-500 outline-none" placeholder="12.9716" required />
             </div>
             <div>
               <label className="block text-sm text-gray-400 mb-1">Longitude (e.g. 77.59) *</label>
               <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-green-500 outline-none" placeholder="77.5946" required />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm text-gray-400 mb-1">Operating Hours</label>
                <input type="text" name="operatingHours" value={formData.operatingHours} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-green-500 outline-none" placeholder="Mon-Sat: 10AM - 7PM" />
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-1">Contact Phone</label>
                <input type="text" name="contactInfo" value={formData.contactInfo} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-green-500 outline-none" placeholder="080-12345678" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Accepted Items (comma separated)</label>
            <input type="text" name="acceptedItems" value={formData.acceptedItems} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-green-500 outline-none" placeholder="Laptops, Mobiles, Batteries..." />
          </div>

          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded mt-6 transition shadow-lg">
            Register Facility
          </button>
        </form>
      </div>
    </div>
  );
};

export default FacilityRegister;