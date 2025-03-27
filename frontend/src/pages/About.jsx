// src/pages/About.jsx

import React from 'react';

const About = () => {
  return (
    <div className="bg-gray-900 min-h-screen py-16 mt-10">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-white mb-8">About Us</h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6">
          At E-Waste Management, we are committed to promoting sustainable practices for electronic waste disposal and recycling. Our mission is to raise awareness about the environmental impact of e-waste and to provide effective solutions for recycling and reusing electronic devices.
        </p>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6">
          With the rapid advancement of technology, electronic waste is becoming one of the fastest-growing waste streams worldwide. We aim to reduce the amount of e-waste that ends up in landfills by encouraging proper recycling and providing a platform for individuals and businesses to responsibly dispose of their electronic devices.
        </p>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Join us in our efforts to create a greener and more sustainable future by participating in our recycling programs and spreading the word about the importance of e-waste management.
        </p>
      </div>
    </div>
  );
};

export default About;
