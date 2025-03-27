import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Link } from 'react-router-dom'; // Import Link

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  // Data for the pie chart
  const co2ReductionData = {
    labels: ['Smartphone', 'Laptop', 'Tablet'],
    datasets: [
      {
        label: 'CO₂ Reduction (kg)',
        data: [10, 50, 12], // CO₂ reduction by each item type
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-center mt-20">My Dashboard</h1>

      {/* Recycle New Item Button */}
      <div className="mb-6 text-center">
        <Link to="/recyclepage">
          <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
            Recycle New Item
          </button>
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recycled Items */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-semibold mb-4">Recycled Items</h2>
          <p className="text-4xl font-bold">35</p>
          <p className="text-gray-400 mt-2">Items Recycled</p>
        </div>

        {/* Points Earned */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-semibold mb-4">Points Earned</h2>
          <p className="text-4xl font-bold">1500</p>
          <p className="text-gray-400 mt-2">Redeemable Points</p>
        </div>

        {/* Contributions to Society */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-semibold mb-4">Your Carbon Footprint</h2>
          <p className="text-4xl font-bold">72 kg</p>
          <p className="text-gray-400 mt-2">CO₂ Reduction</p>
        </div>
      </div>

      {/* Recent Recycled Items */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Recent Recycled Items</h2>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="pb-4">Item</th>
                <th className="pb-4">Date</th>
                <th className="pb-4">Points Earned</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2">Smartphone</td>
                <td className="py-2">Oct 1, 2024</td>
                <td className="py-2">500</td>
              </tr>
              <tr>
                <td className="py-2">Laptop</td>
                <td className="py-2">Sep 28, 2024</td>
                <td className="py-2">1000</td>
              </tr>
              <tr>
                <td className="py-2">Tablet</td>
                <td className="py-2">Sep 20, 2024</td>
                <td className="py-2">300</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Contribution Graph */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Contribution by CO₂ Reduction</h2>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          {/* Pie Chart */}
          <div className="h-64 bg-gray-700 flex items-center justify-center rounded-lg">
            <Pie data={co2ReductionData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
