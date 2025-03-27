// src/pages/Home.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg-gray-900">
      {/* Section 1: Introduction */}
      <section className="py-16 bg-gray-800 rounded-md mt-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-8">E-Waste Management for a Greener Future</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Every year, millions of tons of electronic waste are generated worldwide. In 2023 alone, over <span className="text-2xl font-bold text-blue-400">50 million metric tons</span> of e-waste were produced globally. E-waste contains harmful substances such as mercury, lead, and cadmium, which, if improperly disposed of, contaminate soil, water, and air, causing health and environmental hazards. 
            Unfortunately, less than <span className="text-2xl font-bold text-blue-400">20%</span> of this waste is recycled properly, leading to resource depletion and environmental degradation.
          </p>
        </div>
      </section>

      {/* Section 2: Environmental Impact */}
      <section className="py-16 bg-gray-900 rounded-md">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold text-white mb-8">E-Waste’s Environmental Impact</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            The improper handling of e-waste is a significant environmental threat. Electronics contain valuable metals such as gold, silver, and copper, which require mining, causing deforestation and soil erosion. Recycling <span className="text-2xl font-bold text-blue-400">1 million cell phones</span> can recover <span className="text-2xl font-bold text-blue-400">24 kg of gold</span>, <span className="text-2xl font-bold text-blue-400">250 kg of silver</span>, and <span className="text-2xl font-bold text-blue-400">9,000 kg of copper</span>, preventing the need for new mining. Improper disposal leads to hazardous chemicals leaching into the environment.
          </p>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-6">
            E-waste represents <span className="text-2xl font-bold text-blue-400">2%</span> of America's landfill volume but accounts for <span className="text-2xl font-bold text-blue-400">70%</span> of overall toxic waste. Proper e-waste recycling can help reduce greenhouse gas emissions by <span className="text-2xl font-bold text-blue-400">25%</span>, conserving natural resources and reducing energy consumption.
          </p>
        </div>
      </section>

      {/* Section 3: Carbon Emissions */}
      <section className="py-16 bg-gray-800 rounded-md">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold text-white mb-8">Impact on Carbon Emissions</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            The production and disposal of electronic devices contribute significantly to carbon emissions. It's estimated that producing a single smartphone generates approximately <span className="text-2xl font-bold text-blue-400">85 kilograms of CO₂</span>, mainly from the extraction of raw materials and the manufacturing process. In 2020, e-waste production contributed over <span className="text-2xl font-bold text-blue-400">98 million metric tons of CO₂ equivalents</span> globally.
          </p>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-6">
            By recycling e-waste, we can reduce energy use in manufacturing processes, lowering carbon emissions. For example, recycling aluminum saves <span className="text-2xl font-bold text-blue-400">95%</span> of the energy required to produce it from raw materials, leading to a considerable reduction in greenhouse gases.
          </p>
        </div>
      </section>

 {/* Section 4: How You Can Help */}
<section className="py-16 bg-gray-900 rounded-md">
  <div className="container mx-auto px-4 text-center">
    <h2 className="text-3xl font-semibold text-white mb-8">How You Can Help</h2>
    <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-4">
      Participating in e-waste recycling initiatives is essential. Here are some ways you can contribute:
    </p>
    <ul className="list-disc text-left text-lg text-gray-300 max-w-2xl mx-auto mb-4">
      <li className="bg-gray-700 text-gray-200 p-3 rounded mb-2 shadow hover:bg-gray-600 transition duration-300">
        <b>Educate Yourself:</b> Learn about the components of e-waste and the recycling processes.
      </li>
      <li className="bg-gray-700 text-gray-200 p-3 rounded mb-2 shadow hover:bg-gray-600 transition duration-300">
        <b>Recycle Responsibly:</b> Use designated recycling centers and programs in your community.
      </li>
      <li className="bg-gray-700 text-gray-200 p-3 rounded mb-2 shadow hover:bg-gray-600 transition duration-300">
        <b>Spread the Word:</b> Encourage friends and family to recycle their e-waste and share information on social media.
      </li>
      <li className="bg-gray-700 text-gray-200 p-3 rounded mb-2 shadow hover:bg-gray-600 transition duration-300">
        <b>Support Policies:</b> Advocate for regulations that promote e-waste recycling and proper disposal methods.
      </li>
    </ul>
    <p className="text-lg text-gray-300 max-w-2xl mx-auto">
      Every action counts. By taking part in e-waste recycling efforts, you contribute to a sustainable future.
    </p>
  </div>
</section>


      {/* Section 5: Call to Action */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold text-white mb-10">Join Us in the Fight Against E-Waste</h2>
          <div className="flex justify-center space-x-6">
            <Link to="/login">
              <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300">
                Login
              </button>
            </Link>
            <Link to="/signup">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
