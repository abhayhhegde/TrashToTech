// src/pages/Contact.jsx

import React from 'react';

const Contact = () => {
  return (
    <div className="bg-gray-900 min-h-screen py-16 mt-10">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-white mb-8">Contact Us</h1>
        <p className="text-lg text-gray-300 mb-6">
          We would love to hear from you! If you have any questions, feedback, or inquiries about our e-waste management initiatives, please feel free to reach out using the form below.
        </p>
        <form className="bg-gray-800 p-8 rounded-md shadow-md max-w-md mx-auto">
          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              className="w-full p-2 border border-gray-600 bg-gray-700 text-gray-300 rounded"
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="w-full p-2 border border-gray-600 bg-gray-700 text-gray-300 rounded"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="message">Message</label>
            <textarea
              id="message"
              className="w-full p-2 border border-gray-600 bg-gray-700 text-gray-300 rounded"
              placeholder="Type your message here"
              rows="4"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
