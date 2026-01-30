import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import API from '../api/http';
import { useNavigate } from 'react-router-dom';
import { basePoints, calcPointsForItem } from '../utils/pointsCalculation'; 

const RecyclePage = () => {
  const navigate = useNavigate();
  
  // Generate Category List for Dropdown
  const categories = Object.keys(basePoints).map(key => ({
    value: key,
    label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) // 
  }));

  // Form State
  const [formData, setFormData] = useState({
    category: 'smartphone', // Default
    itemName: '',           // Only used if 'other' is selected
    weight: '',
    condition: 'moderate',
    quantity: 1
  });
  
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [visitResult, setVisitResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load Facility
  useEffect(() => {
    const savedFacility = localStorage.getItem('selectedFacility');
    if (savedFacility) {
      setSelectedFacility(JSON.parse(savedFacility));
    }
  }, []);

  // Handle Input Changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Live Point Calculation
  const estimatedPoints = calcPointsForItem(formData);

  const handleSubmit = async () => {
    if (!selectedFacility) {
      setError("Please select a facility first.");
      return;
    }
    
    // Validation: Require Name if "Other" is selected
    if (formData.category === 'other' && !formData.itemName) {
      setError("Please specify the Item Name.");
      return;
    }

    if (!formData.weight) {
      setError("Please enter approximate weight.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Determine Final Item Name
      
      const finalItemName = formData.category === 'other' 
        ? formData.itemName 
        : categories.find(c => c.value === formData.category)?.label || formData.category;

      const payload = {
        facilityId: selectedFacility._id,
        estimatedPoints: estimatedPoints, // Send frontend estimate
        items: [{
          itemName: finalItemName,
          category: formData.category,
          condition: formData.condition,
          weight: parseFloat(formData.weight),
          quantity: parseInt(formData.quantity),
          estimatedPoints: estimatedPoints
        }]
      };

      const res = await API.post('/visit/schedule', payload);
      setVisitResult(res.data);
      
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Scheduling failed");
    } finally {
      setLoading(false);
    }
  };

  // --- VIEW: SUCCESS (QR CODE) ---
  if (visitResult) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 pt-24 flex justify-center">
        <div className="bg-gray-800 p-8 rounded-lg max-w-lg w-full text-center shadow-2xl border border-green-600">
          <h2 className="text-3xl font-bold text-green-400 mb-2">Visit Scheduled!</h2>
          <p className="text-gray-400 mb-6">Show this QR code at the facility.</p>
          
          <div className="bg-white p-4 rounded-lg inline-block mb-6">
            <QRCode value={visitResult.referenceNumber} size={180} />
          </div>

          <div className="text-2xl font-mono font-bold mb-6 tracking-wider bg-gray-900 p-2 rounded border border-gray-700">
            {visitResult.referenceNumber}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-700 p-3 rounded">
              <div className="text-sm text-gray-400">Total Value</div>
              <div className="text-xl font-bold text-yellow-400">{visitResult.estimatedPoints} pts</div>
            </div>
            <div className="bg-gray-700 p-3 rounded border border-green-500/30">
              <div className="text-sm text-gray-400">Upfront (30%)</div>
              <div className="text-xl font-bold text-green-400">+{visitResult.pendingPoints || 0} pts</div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-bold transition shadow-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW: FORM ---
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pt-24">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT: FACILITY CARD */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg h-fit">
          <h2 className="text-xl font-bold mb-4 text-blue-400 border-b border-gray-700 pb-2">1. Selected Facility</h2>
          {selectedFacility ? (
            <div>
              <h3 className="text-2xl font-bold">{selectedFacility.name}</h3>
              <p className="text-gray-400 mt-1 text-sm">{selectedFacility.address}</p>
              <div className="mt-4 flex gap-2">
                 <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded">Verified</span>
                 <span className="bg-blue-900 text-blue-300 text-xs px-2 py-1 rounded">E-Waste Only</span>
              </div>
              <button 
                onClick={() => navigate('/facilities')}
                className="mt-6 w-full py-2 border border-blue-500 text-blue-400 hover:bg-blue-900/30 rounded transition text-sm"
              >
                Change Facility
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No facility selected.</p>
              <button 
                onClick={() => navigate('/facilities')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold transition shadow-lg"
              >
                Find Nearest Facility
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: SMART FORM */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
          <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
             <h2 className="text-xl font-bold text-green-400">2. Item Details</h2>
             <span className="text-xs text-gray-500">Step 2 of 2</span>
          </div>

          {error && <div className="bg-red-900/50 border border-red-500 p-3 text-red-200 text-sm rounded mb-4">{error}</div>}
          
          <div className="space-y-4">
            
            {/* 1. CATEGORY DROPDOWN */}
            <div>
              <label className="block text-sm mb-1 text-gray-400">Select Item Category</label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleInputChange} 
                className="w-full p-3 bg-gray-700 rounded outline-none border border-gray-600 focus:border-green-500 text-white"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* 2. DYNAMIC INPUT  */}
            {formData.category === 'other' && (
              <div className="animate-fade-in">
                <label className="block text-sm mb-1 text-yellow-400">Specify Item Name</label>
                <input 
                  name="itemName" 
                  value={formData.itemName} 
                  onChange={handleInputChange} 
                  className="w-full p-3 bg-gray-700 rounded outline-none focus:border-yellow-500 border border-yellow-500/50 transition" 
                  placeholder="e.g. Electric Guitar" 
                />
              </div>
            )}
            
            {/* 3. DETAILS GRID */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-gray-400">Condition</label>
                <select name="condition" value={formData.condition} onChange={handleInputChange} className="w-full p-3 bg-gray-700 rounded outline-none border border-gray-600 focus:border-green-500">
                  <option value="good">Good (Working)</option>
                  <option value="moderate">Moderate (Fixable)</option>
                  <option value="poor">Poor (Scrap)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-400">Quantity</label>
                <input type="number" name="quantity" min="1" value={formData.quantity} onChange={handleInputChange} className="w-full p-3 bg-gray-700 rounded outline-none focus:border-green-500 border border-gray-600" />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-400">Approx Weight (kg)</label>
              <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} className="w-full p-3 bg-gray-700 rounded outline-none focus:border-green-500 border border-gray-600" placeholder="0.5" />
            </div>

            {/* LIVE PREVIEW BOX */}
            <div className="bg-gray-900 p-4 rounded border border-gray-700 flex justify-between items-center mt-2">
               <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Estimated Value</p>
                  <p className="text-xs text-gray-500">Based on material rates</p>
               </div>
               <div className="text-right">
                  <p className="text-2xl font-bold text-green-400">{estimatedPoints} <span className="text-sm">pts</span></p>
               </div>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={loading || !selectedFacility}
              className={`w-full py-4 rounded-lg font-bold mt-4 transition shadow-lg flex justify-center items-center gap-2 ${
                loading || !selectedFacility 
                  ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                  : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white'
              }`}
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <>Schedule & Get {Math.floor(estimatedPoints * 0.3)} Pts Now ➔</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecyclePage;