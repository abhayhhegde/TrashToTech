import React, { useState } from 'react';
import FacilityMap from '../components/FacilityMap'; 
import { useNavigate } from 'react-router-dom';

export default function FacilityLocator() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const handleSelect = (facility) => {
    setSelected(facility);
  };

  const handleProceed = () => {
    if (!selected) return alert('Please select a facility marker on the map first.');
    
    // 1. Save the facility so RecyclePage knows who to send the items to
    localStorage.setItem('selectedFacility', JSON.stringify(selected));
    
    // 2. Navigate to the Recycle Form (Matches route in App.js)
    navigate('/recycle');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pt-24">
      <h1 className="text-3xl font-bold mb-6 text-center">Find Nearby Facilities</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Left: Map */}
        <div className="lg:col-span-2">
          <FacilityMap onSelectFacility={handleSelect} />
        </div>

        {/* Right: Details Panel */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-fit border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Facility Details</h2>
          
          {selected ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-green-400">{selected.name}</h3>
                <p className="text-gray-300 mt-1">{selected.address}</p>
              </div>
              
              <div className="bg-gray-700 p-3 rounded">
                <span className="text-sm text-gray-400 block mb-1">Operating Hours</span>
                <span>{selected.operatingHours || '9:00 AM - 6:00 PM'}</span>
              </div>

              <div>
                <span className="text-sm text-gray-400 block mb-1">Accepted Items</span>
                <div className="flex flex-wrap gap-2">
                  {selected.acceptedItems?.map((item, i) => (
                    <span key={i} className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded-full">
                      {item}
                    </span>
                  )) || <span className="text-gray-500">All E-Waste</span>}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={handleProceed} 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition shadow-lg"
                >
                  Schedule Visit
                </button>
                <button 
                  onClick={() => setSelected(null)} 
                  className="px-4 py-2 border border-gray-600 hover:bg-gray-700 rounded transition"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 bg-gray-900/50 rounded border border-dashed border-gray-700">
              <p>Click a marker on the map to see details here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}