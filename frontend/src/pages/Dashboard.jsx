import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Link, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code'; 
import API from '../api/http';
import { getLevel, getNextLevelProgress } from '../utils/levelLogic';
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const res = await API.get('/users/profile');
      const { user, stats: backendStats, history: visitHistory } = res.data;

      
      const itemsByCategory = {};
      let calculatedTotalItems = 0;
      let totalPendingPoints = 0;

      visitHistory.forEach(visit => {
        // Calculate pending points manually from history to be safe
        if (visit.status === 'scheduled' || visit.status === 'pending') {
            totalPendingPoints += (visit.pendingPoints || 0);
        }

        // Logic for Pie Chart & Total Count
        if (visit.items && Array.isArray(visit.items)) {
          visit.items.forEach(item => {
            const cat = item.category || 'other';
            const qty = item.quantity || 1;
            
            // Only count items as "Recycled" if status is COMPLETED
            if (visit.status === 'completed') {
                calculatedTotalItems += qty;
            }

            // Pie Chart Data
            if (visit.status === 'completed') {
                const co2Value = (item.weight || 1) * 2; 
                if (!itemsByCategory[cat]) {
                itemsByCategory[cat] = { co2: 0, count: 0 };
                }
                itemsByCategory[cat].co2 += co2Value;
                itemsByCategory[cat].count += qty;
            }
          });
        }
      });

      // 3. Map to State
      setStats({
        level: user.level || 'Bronze',
        totalPoints: user.points,  
        pendingPoints: totalPendingPoints, 
        totalItems: calculatedTotalItems, // ONLY completed items
        totalCO2Reduction: backendStats.co2Saved,
        itemsByCategory: itemsByCategory
      });

      setHistory(visitHistory);

    } catch (err) {
      console.error('Dashboard fetch error:', err);
      if (err.response && err.response.status === 401) {
          navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper for QR Download
  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-${selectedQR.referenceNumber}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center animate-pulse pt-24">
      Loading dashboard...
    </div>
  );

  const categoryColors = { smartphone: '#FF6384', laptop: '#36A2EB', tablet: '#FFCE56', other: '#4BC0C0' };
  const hasData = stats?.itemsByCategory && Object.keys(stats.itemsByCategory).length > 0;

  const co2ReductionData = hasData ? {
    labels: Object.keys(stats.itemsByCategory).map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
    datasets: [{
      data: Object.values(stats.itemsByCategory).map(item => Math.round(item.co2)),
      backgroundColor: Object.keys(stats.itemsByCategory).map(cat => categoryColors[cat] || '#9ca3af'),
      borderWidth: 0
    }],
  } : { labels: ['No Data'], datasets: [{ data: [1], backgroundColor: ['#374151'] }] };

  const currentLevel = getLevel(stats.totalPoints || 0);
  const progressPercent = getNextLevelProgress(stats.totalPoints || 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 pt-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold">My Dashboard</h1>
           <p className="text-gray-400">Track your environmental impact</p>
        </div>
        <Link to="/facilities" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition shadow-lg shadow-green-900/20">
          + Schedule New Drop-off
        </Link>
      </div>

      {/* LEVEL CARD */}
    <div className={`bg-gray-800 p-6 rounded-xl border-2 ${currentLevel.borderColor} shadow-lg mb-8 flex items-center justify-between`}>
      <div>
        <p className="text-gray-400 uppercase text-xs tracking-wider">Current Status</p>
        <h2 className={`text-3xl font-bold ${currentLevel.color}`}>{currentLevel.name}</h2>
        <p className="text-sm text-gray-400 mt-1">{currentLevel.description}</p>
      </div>
      
      {/* Visual Progress */}
      <div className="text-right">
        <p className="text-2xl font-bold text-white">{Math.round(progressPercent)}%</p>
        <p className="text-xs text-gray-500">to next rank</p>
      </div>
    </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* RECYCLED ITEMS (Completed Only) */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center border-t-4 border-blue-500">
          <p className="text-gray-400 uppercase text-xs tracking-wider">Recycled Items</p>
          <p className="text-4xl font-bold mt-2">{stats?.totalItems || 0}</p>
          <p className="text-gray-500 text-xs mt-1">Verified Drop-offs</p>
        </div>
        
        {/* POINTS */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center border-t-4 border-yellow-500">
          <p className="text-gray-400 uppercase text-xs tracking-wider">Total Points</p>
          <p className="text-4xl font-bold mt-2">{stats?.totalPoints || 0}</p>
          {stats?.pendingPoints > 0 && <p className="text-yellow-400 text-sm mt-1 animate-pulse">+{stats.pendingPoints} pending</p>}
        </div>
        
        {/* CO2 */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center border-t-4 border-green-500">
          <p className="text-gray-400 uppercase text-xs tracking-wider">CO₂ Saved (kg)</p>
          <p className="text-4xl font-bold mt-2">{stats?.totalCO2Reduction || 0}</p>
        </div>
      </div>

      {/* History & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold">Recent Activity</h2>
             <button onClick={fetchDashboardData} className="text-xs text-blue-400 hover:text-white border border-blue-400 px-2 py-1 rounded">Refresh Data</button>
          </div>
          <div className="overflow-auto max-h-96">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700 uppercase text-xs">
                    <th className="pb-3 px-2">Date</th>
                    <th className="pb-3 px-2">Items</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {history.length === 0 ? (
                    <tr><td colSpan="4" className="py-8 text-center text-gray-500">No history found.</td></tr>
                ) : (
                    history.map((visit) => (
                      <tr key={visit._id} className="hover:bg-gray-700/30 transition">
                        <td className="py-3 px-2">{new Date(visit.scheduledAt).toLocaleDateString()}</td>
                        <td className="py-3 px-2">
                            {visit.items.map(i => i.category || 'Item').slice(0, 2).join(', ')} 
                            {visit.items.length > 2 && ` +${visit.items.length - 2}`}
                        </td>
                        <td className="py-3 px-2">
                            <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${
                                visit.status === 'completed' ? 'bg-green-900/50 text-green-300' : 
                                visit.status === 'rejected' ? 'bg-red-900/50 text-red-300' :
                                'bg-yellow-900/50 text-yellow-300'
                            }`}>
                                {visit.status === 'scheduled' ? 'Pending' : visit.status}
                            </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button onClick={() => setSelectedQR(visit)} className="text-blue-400 hover:text-blue-300 text-xs border border-blue-400/30 px-2 py-1 rounded">
                             View QR
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold mb-6">Impact Breakdown (Verified)</h2>
          <div className="w-64 h-64">
            <Pie data={co2ReductionData} options={{ maintainAspectRatio: true, plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } } }} />
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedQR(null)}>
          <div className="bg-white p-6 rounded-xl text-center max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Scan at Facility</h3>
            <p className="text-gray-500 text-sm mb-4">Show this to verify your drop-off</p>
            
            <div className="bg-gray-100 p-4 rounded-lg mb-4 inline-block">
               <QRCode id="qr-code-svg" value={selectedQR.referenceNumber} size={180} />
            </div>
            
            <p className="text-gray-900 font-mono font-bold text-lg mb-6 tracking-widest">{selectedQR.referenceNumber}</p>
            
            <div className="grid grid-cols-2 gap-3">
              <button onClick={downloadQR} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition">Download</button>
              <button onClick={() => setSelectedQR(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;