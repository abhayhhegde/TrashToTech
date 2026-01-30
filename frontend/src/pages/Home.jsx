import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg-gray-900 min-h-screen text-white pt-20">
      
      {/* HERO SECTION */}
      <section className="py-20 bg-gray-800 rounded-b-3xl shadow-xl mb-12 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-6">
            E-Waste Management for a Greener Future
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Every year, over <span className="text-blue-400 font-bold">50 million metric tons</span> of e-waste is generated. 
            Turn your old gadgets into rewards and help save the planet today.
          </p>
          
          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/login">
              <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transition transform hover:scale-105">
                Start Recycling Now
              </button>
            </Link>
            <Link to="/facilities">
              <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transition transform hover:scale-105">
                Find Nearest Facility
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS*/}
      


      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-750 transition">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="text-xl font-bold text-green-400 mb-2">1. Locate</h3>
            <p className="text-gray-400">Use our map to find certified e-waste facilities near you.</p>
          </div>
          <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-750 transition">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-blue-400 mb-2">2. Schedule</h3>
            <p className="text-gray-400">Enter your item details and get a QR code for drop-off.</p>
          </div>
          <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-750 transition">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-xl font-bold text-yellow-400 mb-2">3. Earn</h3>
            <p className="text-gray-400">Get verified at the facility and earn points for rewards.</p>
          </div>
        </div>
      </section>

      {/* EDUCATIONAL SECTIONS  */}
      <section className="py-16 bg-gray-800 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold text-white mb-8">E-Waste’s Environmental Impact</h2>
          <p className="text-lg text-gray-300 max-w-4xl mx-auto">
             Recycling <span className="text-blue-400 font-bold">1 million cell phones</span> can recover 24 kg of gold, 250 kg of silver, and 9,000 kg of copper.
             E-waste represents only 2% of landfill volume but accounts for <span className="text-blue-400 font-bold">70% of toxic waste</span>.
          </p>
        </div>
      </section>

      {/* FACILITY PARTNER SECTION  */}
      <section className="py-20 px-6">
        <div className="container mx-auto bg-gradient-to-r from-blue-900 to-gray-800 rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between shadow-2xl border border-gray-700">
          <div className="mb-6 md:mb-0 md:pr-8 text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Are you a Recycling Facility?</h2>
            <p className="text-gray-300 text-lg">
              Partner with us to digitize your intake process. verify transactions with QR codes, and track impact automatically.
            </p>
          </div>
          <div className="flex gap-4">
             <Link to="/facility/login" className="bg-white text-blue-900 px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition shadow-lg">
               Facility Login
             </Link>
             <Link to="/facility/register" className="border-2 border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white/10 transition">
               Register as Partner
             </Link>
          </div>
        </div>
      </section>

      {/* FOOTER CALL TO ACTION */}
      <section className="py-16 bg-gray-900 text-center border-t border-gray-800">
        <h2 className="text-3xl font-semibold text-white mb-8">Join the Fight Against E-Waste</h2>
        <div className="flex justify-center space-x-6">
          <Link to="/signup">
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-10 rounded-full transition-all duration-300 shadow-lg shadow-green-900/40">
              Get Started Today
            </button>
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;