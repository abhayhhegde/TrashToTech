import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Link } from 'react-router-dom';
import API from '../api/http';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, scheduled, completed, cancelled
  const [selectedQR, setSelectedQR] = useState(null); // For QR modal

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, historyRes] = await Promise.all([
        API.get('/api/user/stats'),
        API.get('/api/user/history')
      ]);
      setStats(statsRes.data);
      setHistory(historyRes.data); // Get ALL visits
      setError(null);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = filterStatus === 'all'
    ? history
    : history.filter(visit => visit.status === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-2xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  // Prepare pie chart data from actual stats
  const categoryColors = {
    smartphone: '#FF6384',
    laptop: '#36A2EB',
    tablet: '#FFCE56',
    other: '#4BC0C0'
  };

  const hasData = stats?.itemsByCategory && Object.keys(stats.itemsByCategory).length > 0;

  const co2ReductionData = hasData ? {
    labels: Object.keys(stats.itemsByCategory).map(cat =>
      cat.charAt(0).toUpperCase() + cat.slice(1)
    ),
    datasets: [
      {
        label: 'CO₂ Reduction (kg)',
        data: Object.values(stats.itemsByCategory).map(item => Math.round(item.co2)),
        backgroundColor: Object.keys(stats.itemsByCategory).map(
          cat => categoryColors[cat.toLowerCase()] || '#4BC0C0'
        ),
        hoverBackgroundColor: Object.keys(stats.itemsByCategory).map(
          cat => categoryColors[cat.toLowerCase()] || '#4BC0C0'
        ),
      },
    ],
  } : {
    labels: ['No Data'],
    datasets: [{
      label: 'CO₂ Reduction (kg)',
      data: [1],
      backgroundColor: ['#374151'],
    }]
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-center mt-20">My Dashboard</h1>

      {/* User Level Badge */}
      <div className="mb-6 text-center">
        <span className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${
          stats?.level === 'Platinum' ? 'bg-gray-300 text-gray-900' :
          stats?.level === 'Gold' ? 'bg-yellow-500 text-gray-900' :
          stats?.level === 'Silver' ? 'bg-gray-400 text-gray-900' :
          'bg-orange-700 text-white'
        }`}>
          {stats?.level || 'Bronze'} Level
        </span>
      </div>

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
          <p className="text-4xl font-bold">{stats?.totalItems || 0}</p>
          <p className="text-gray-400 mt-2">Items Recycled</p>
        </div>

        {/* Points Earned */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-semibold mb-4">Points Earned</h2>
          <p className="text-4xl font-bold">{stats?.totalPoints || 0}</p>
          <p className="text-gray-400 mt-2">Redeemable Points</p>
          {stats?.pendingPoints > 0 && (
            <p className="text-yellow-500 text-sm mt-1">+{stats.pendingPoints} pending</p>
          )}
        </div>

        {/* Contributions to Society */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-semibold mb-4">Your Carbon Footprint</h2>
          <p className="text-4xl font-bold">{stats?.totalCO2Reduction || 0} kg</p>
          <p className="text-gray-400 mt-2">CO₂ Reduction</p>
        </div>
      </div>

      {/* All Recycling Visits */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">All Recycling Visits</h2>

        {/* Filter Buttons */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            All ({history.length})
          </button>
          <button
            onClick={() => setFilterStatus('scheduled')}
            className={`px-4 py-2 rounded ${filterStatus === 'scheduled' ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Pending ({history.filter(v => v.status === 'scheduled').length})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-2 rounded ${filterStatus === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Completed ({history.filter(v => v.status === 'completed').length})
          </button>
          <button
            onClick={() => setFilterStatus('cancelled')}
            className={`px-4 py-2 rounded ${filterStatus === 'cancelled' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Cancelled ({history.filter(v => v.status === 'cancelled').length})
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg overflow-x-auto">
          {filteredHistory && filteredHistory.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-4">Reference</th>
                  <th className="pb-4">Items</th>
                  <th className="pb-4">Facility</th>
                  <th className="pb-4">Date</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Points</th>
                  <th className="pb-4">QR Code</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((visit, idx) => (
                  <tr key={visit._id || idx} className="border-b border-gray-700">
                    <td className="py-3">
                      <span className="font-mono text-sm font-bold text-blue-400">
                        {visit.referenceNumber}
                      </span>
                    </td>
                    <td className="py-3">
                      {visit.items && visit.items.length > 0
                        ? visit.items.map(item => item.itemName).join(', ')
                        : 'N/A'}
                    </td>
                    <td className="py-3 text-sm">
                      {visit.facility ? (
                        <div>
                          <div className="font-semibold">{visit.facility.name}</div>
                          <div className="text-gray-400 text-xs">{visit.facility.address}</div>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="py-3">{formatDate(visit.scheduledAt)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        visit.status === 'completed' ? 'bg-green-700' :
                        visit.status === 'cancelled' ? 'bg-red-700' :
                        'bg-yellow-700'
                      }`}>
                        {visit.status}
                      </span>
                    </td>
                    <td className="py-3 font-semibold">
                      {visit.status === 'completed' ? visit.actualPoints : visit.estimatedPoints}
                      {visit.status === 'scheduled' && (
                        <span className="text-yellow-500 text-xs block">
                          +{visit.pendingPoints} pending
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      {visit.qrCodeDataUrl ? (
                        <button
                          onClick={() => setSelectedQR(visit)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                        >
                          View QR
                        </button>
                      ) : (
                        <span className="text-gray-500 text-xs">No QR</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center text-gray-400 py-8">
              {filterStatus === 'all'
                ? 'No recycling history yet. Start recycling to see your impact!'
                : `No ${filterStatus} visits.`}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {selectedQR && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedQR(null)}
        >
          <div
            className="bg-gray-800 p-6 rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">QR Code - {selectedQR.referenceNumber}</h3>
              <button
                onClick={() => setSelectedQR(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="bg-white p-4 rounded flex justify-center items-center">
              <img src={selectedQR.qrCodeDataUrl} alt="QR Code" className="w-64 h-64" />
            </div>
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm mb-2">Show this QR code at the facility</p>
              <p className="font-mono text-lg font-bold text-blue-400">{selectedQR.referenceNumber}</p>
              {selectedQR.facility && (
                <div className="mt-3 text-sm">
                  <p className="font-semibold">{selectedQR.facility.name}</p>
                  <p className="text-gray-400">{selectedQR.facility.address}</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = selectedQR.qrCodeDataUrl;
                  link.download = `QR-${selectedQR.referenceNumber}.png`;
                  link.click();
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Download QR
              </button>
              <button
                onClick={() => setSelectedQR(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contribution Graph */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Contribution by CO₂ Reduction</h2>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          {/* Pie Chart */}
          <div className="h-64 bg-gray-700 flex items-center justify-center rounded-lg">
            {hasData ? (
              <Pie data={co2ReductionData} />
            ) : (
              <div className="text-gray-400">No data to display yet. Start recycling!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
