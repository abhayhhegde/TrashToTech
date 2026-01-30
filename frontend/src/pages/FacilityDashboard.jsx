import React, { useState, useEffect } from 'react';
import API from '../api/http';

const FacilityDashboard = () => {
  const [stats, setStats] = useState({ pendingCount: 0, completedCount: 0, totalItems: 0 });
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Modal State
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectingVisit, setInspectingVisit] = useState(null); 
  const [isRejecting, setIsRejecting] = useState(false); // Controls the "Are you sure?" view

  // Toast State (For Notifications)
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchDashboardData = async () => {
    try {
      const res = await API.get('/facilities/dashboard');
      setStats(res.data.stats);
      setVisits(res.data.visits);
    } catch (err) {
      console.error("Failed to load dashboard", err);
      showToast("Failed to refresh data", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- SMART SCAN LOGIC ---
  const handleScanOrSearch = (e) => {
    // If user presses ENTER in the search box (Scanners send 'Enter' automatically)
    if (e.key === 'Enter') {
      const exactMatch = visits.find(v => 
        v.referenceNumber.toLowerCase() === searchTerm.toLowerCase()
      );

      if (exactMatch) {
        setInspectingVisit(exactMatch); // Auto-open the modal
        setSearchTerm(''); // Clear input for the next scan
        showToast("QR Code Verified!", "success");
      } else {
        showToast("Invalid QR Code or Visit not found", "error");
      }
    }
  };

  // 1. REJECT LOGIC
  const handleReject = async () => {
    try {
      await API.post('/visit/confirm', { 
        referenceNumber: inspectingVisit.referenceNumber, 
        action: 'reject' 
      });
      
      closeModal();
      fetchDashboardData();
      showToast("Visit Rejected. Points revoked.", "error"); // Red Toast
    } catch (err) {
      showToast("Error rejecting visit.", "error");
    }
  };

  // 2. CONFIRM LOGIC
  const handleConfirm = async () => {
    try {
      await API.post('/visit/confirm', { 
        referenceNumber: inspectingVisit.referenceNumber, 
        action: 'accept' 
      });
      
      closeModal();
      fetchDashboardData();
      showToast("Success! Points transferred to user.", "success"); // Green Toast
    } catch (err) {
      showToast("Error confirming visit.", "error");
    }
  };

  const closeModal = () => {
    setInspectingVisit(null);
    setIsRejecting(false); // Reset the "Are you sure?" view
  };

  // Filter Logic
  const filteredVisits = visits.filter(visit => {
    if (!searchTerm) return true;
    const lowerTerm = searchTerm.toLowerCase();
    const refMatch = visit.referenceNumber?.toLowerCase().includes(lowerTerm);
    const userMatch = visit.userId?.username?.toLowerCase().includes(lowerTerm);
    return refMatch || userMatch;
  });

  if (loading) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center pt-24">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-4 w-4 bg-green-500 rounded-full mb-2 animate-bounce"></div>
        Loading Console...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans pt-24 relative">
      
      
      {/* CUSTOM TOAST COMPONENT  */}
     
      {toast && (
        <div className={`fixed top-24 right-6 z-[100] px-6 py-4 rounded-lg shadow-2xl border-l-4 flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 ${
          toast.type === 'error' 
            ? 'bg-gray-800 border-red-500 text-red-100' 
            : 'bg-gray-800 border-green-500 text-green-100'
        }`}>
          <span className="text-2xl">{toast.type === 'error' ? '✖' : '✓'}</span>
          <div>
            <h4 className="font-bold text-sm uppercase">{toast.type === 'error' ? 'Error' : 'Verified'}</h4>
            <p className="text-sm opacity-90">{toast.message}</p>
          </div>
        </div>
      )}

      <div className="p-6 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
             <h1 className="text-3xl font-bold text-white tracking-tight">Facility Dashboard</h1>
             <p className="text-gray-400 mt-1">Manage incoming recycling requests</p>
          </div>
          
          {/* SMART SCANNER INPUT */}
          <div className="flex w-full md:w-auto gap-2 relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-lg">📷</span> 
            </div>
            <input 
              type="text" 
              placeholder="Click here & Scan QR..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleScanOrSearch} // <--- LISTENS FOR ENTER KEY
              className="pl-10 bg-gray-800 border-2 border-gray-600 text-white px-4 py-2 rounded-lg focus:border-green-500 focus:shadow-green-500/20 outline-none w-full md:w-80 transition-all font-mono tracking-wide"
              autoFocus
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Pending Visits" value={stats.pendingCount} color="text-yellow-400" />
          <StatCard title="Completed Today" value={stats.completedCount} color="text-green-400" />
          <StatCard title="Total Items" value={stats.totalItems} color="text-blue-400" />
        </div>

        {/* Schedule Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Incoming Schedule</h2>
            <button onClick={fetchDashboardData} className="text-sm text-green-400 hover:text-green-300">↻ Refresh List</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-700/50 text-gray-100 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">Ref ID</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredVisits.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 italic">
                      {searchTerm ? 'No matching visits found.' : 'No visits scheduled yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredVisits.map((visit) => (
                    <tr key={visit._id} className="hover:bg-gray-700/30 transition">
                      <td className="px-6 py-4 font-mono text-blue-300 font-bold">
                        {visit.referenceNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={visit.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{visit.userId?.username || 'Guest'}</div>
                        <div className="text-xs text-gray-500">{visit.userId?.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {visit.items?.map((item, idx) => (
                            <span key={idx} className="bg-gray-700 px-2 py-0.5 rounded text-xs">
                              {item.category || 'Item'} (x{item.quantity})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(visit.scheduledAt || visit.scheduledDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {(visit.status === 'pending' || visit.status === 'scheduled') ? (
                          <button 
                            onClick={() => setInspectingVisit(visit)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs font-bold shadow-lg transition"
                          >
                            INSPECT
                          </button>
                        ) : (
                          <span className="text-gray-500 text-xs italic">Closed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

     
      {/* VERIFICATION MODAL     */}
      
      {inspectingVisit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full border border-gray-700 overflow-hidden transform transition-all scale-100" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="bg-gray-700 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isRejecting ? 'Confirm Rejection' : 'Verify Drop-off'}
                </h2>
                <p className="text-blue-300 font-mono text-sm mt-1">{inspectingVisit.referenceNumber}</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              
              {/* --- VIEW 1: NORMAL INSPECTION --- */}
              {!isRejecting && (
                <>
                  <div className="bg-gray-900/50 p-4 rounded-lg mb-6 border border-gray-700">
                    <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Items Declared</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {inspectingVisit.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-800 p-3 rounded border border-gray-700/50">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center text-xs text-white font-bold">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm">{item.itemName || item.category}</div>
                              <div className="text-xs text-gray-500">{item.condition} • {item.weight ? `${item.weight}kg` : `Qty: ${item.quantity}`}</div>
                            </div>
                          </div>
                          <div className="text-green-400 font-mono font-bold text-sm">
                              ~{50 * (item.quantity || 1)} pts
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-gray-700/30 p-4 rounded-lg border border-gray-600/30">
                    <span className="text-gray-400">Total Estimated Value</span>
                    <span className="text-2xl font-bold text-yellow-400">{inspectingVisit.estimatedPoints} pts</span>
                  </div>
                </>
              )}

              {/* --- VIEW 2: REJECT CONFIRMATION --- */}
              {isRejecting && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    !
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Are you sure?</h3>
                  <p className="text-gray-400 max-w-sm mx-auto">
                    This will mark the visit as <b>Rejected</b>. The user's pending points will be revoked immediately. This action cannot be undone.
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer (Actions) */}
            <div className="p-6 bg-gray-900 border-t border-gray-700 flex justify-end gap-3">
              
              {!isRejecting ? (
                <>
                  <button 
                    onClick={() => setIsRejecting(true)} // Switch view
                    className="px-6 py-3 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 font-bold transition text-sm"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={handleConfirm}
                    className="px-8 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-900/20 transition flex items-center gap-2 text-sm"
                  >
                    <span>✓</span> Confirm & Pay
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setIsRejecting(false)} 
                    className="px-6 py-3 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-800 font-bold transition text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleReject} // Actually Reject
                    className="px-8 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-900/20 transition text-sm"
                  >
                    Yes, Reject Visit
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Helper Components for cleaner JSX
const StatCard = ({ title, value, color }) => (
  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
    <h3 className="text-gray-400 text-sm uppercase tracking-wider">{title}</h3>
    <p className={`text-4xl font-bold mt-2 ${color}`}>{value}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    completed: 'bg-green-900/50 text-green-300 border-green-700',
    rejected: 'bg-red-900/50 text-red-300 border-red-700',
    pending: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
    scheduled: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-bold border ${styles[status] || styles.pending}`}>
      {status.toUpperCase()}
    </span>
  );
};

export default FacilityDashboard;