// src/pages/Contact.jsx
import React, { useState, useEffect } from 'react';

const Contact = () => {
  
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  
  
  const [status, setStatus] = useState('idle'); 
  const [showToast, setShowToast] = useState(false);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('loading');

   
    setTimeout(() => {
      setStatus('success');
      setShowToast(true);
      setFormData({ name: '', email: '', message: '' }); 
      
      // Auto-hide Toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
        setStatus('idle');
      }, 3000);
    }, 2000);
  };

  return (
    <div className="bg-gray-900 min-h-screen py-16 mt-10 relative overflow-hidden">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
          We would love to hear from you! If you have any questions about e-waste management, drop us a message below.
        </p>

        <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md mx-auto border border-gray-700">
          
          {/* NAME INPUT */}
          <div className="mb-4 text-left">
            <label className="block text-gray-400 text-sm mb-2" htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:border-green-500 transition-colors"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* EMAIL INPUT */}
          <div className="mb-4 text-left">
            <label className="block text-gray-400 text-sm mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:border-green-500 transition-colors"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* MESSAGE INPUT */}
          <div className="mb-6 text-left">
            <label className="block text-gray-400 text-sm mb-2" htmlFor="message">Message</label>
            <textarea
              id="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full p-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:border-green-500 transition-colors"
              placeholder="Type your message here..."
              rows="4"
              required
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={status === 'loading'}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all duration-300 shadow-lg flex justify-center items-center gap-2 ${
              status === 'loading' 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 hover:shadow-green-500/20'
            }`}
          >
            {status === 'loading' ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              "Send Message"
            )}
          </button>
        </form>
      </div>

      {/* --- SUCCESS TOAST NOTIFICATION --- */}
      <div 
        className={`fixed bottom-5 right-5 transform transition-all duration-500 ease-out z-50 ${
          showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
      >
        <div className="bg-gray-800 border-l-4 border-green-500 text-white px-6 py-4 rounded shadow-2xl flex items-center gap-4 max-w-sm">
          <div className="bg-green-500/20 p-2 rounded-full">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div>
            <p className="font-bold text-lg">Message Sent!</p>
            <p className="text-gray-400 text-sm">We'll get back to you shortly.</p>
          </div>
          <button 
            onClick={() => setShowToast(false)}
            className="text-gray-500 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      </div>

    </div>
  );
};

export default Contact;