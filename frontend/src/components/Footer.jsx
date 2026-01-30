// components/Footer.jsx
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-800 text-white text-center py-4 mt-auto border-t border-gray-700">
      <p className="text-sm text-gray-400">
        &copy; {currentYear} TrashToTech | <span className="text-green-400">Recycle Reward Repeat</span>
      </p>
    </footer>
  );
}

export default Footer;