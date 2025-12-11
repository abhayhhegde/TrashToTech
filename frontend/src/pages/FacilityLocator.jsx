// src/pages/FacilityLocator.jsx
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
    if (!selected) return alert('Select a facility first.');
    localStorage.setItem('selectedFacility', JSON.stringify(selected));
    navigate('/recyclepage'); // RecyclePage will read selected facility from localStorage
  };

  return (
    <div className="p-6 mt-20">
      <h1 className="text-2xl font-bold mb-4">Find Nearby E-waste Facilities</h1>
      <FacilityMap onSelectFacility={handleSelect} />
      <div className="mt-4 max-w-3xl mx-auto bg-gray-800 p-4 rounded">
        {selected ? (
          <>
            <h3 className="font-bold">{selected.name}</h3>
            <p>{selected.address}</p>
            <p>Accepts: {selected.acceptedItems?.join(', ')}</p>
            <div className="mt-3 flex gap-3">
              <button onClick={handleProceed} className="bg-green-600 px-4 py-2 rounded">Use this facility</button>
              <button onClick={()=>setSelected(null)} className="bg-gray-600 px-4 py-2 rounded">Deselect</button>
            </div>
          </>
        ) : (
          <p>Select a facility marker on the map to proceed.</p>
        )}
      </div>
    </div>
  );
}
