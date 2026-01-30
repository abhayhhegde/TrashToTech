// src/components/FacilityMap.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Keeps pins visible
import API from '../api/http';

// Fix for Leaflet's missing icon images
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const FacilityMap = ({ center = [12.9716, 77.5946], zoom = 11, onSelectFacility }) => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // --- FIX IS HERE: Added '/api' to the path ---
        const res = await API.get('/facilities'); 
        setFacilities(res.data || []);
      } catch (err) {
        console.error('Failed to load facilities:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="w-full h-full min-h-[500px] rounded-lg overflow-hidden shadow-lg border border-gray-700 relative z-0">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer 
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" 
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {facilities.map((f, index) => {
          // Check for valid location data
          const coords = f.location?.coordinates;
          if (!coords || coords.length !== 2) return null;
          
          // CRITICAL: MongoDB is [Longitude, Latitude], Leaflet needs [Latitude, Longitude]
          const [lng, lat] = coords;

          return (
            <Marker 
              key={f._id || index} 
              position={[lat, lng]} 
              eventHandlers={{
                click: () => onSelectFacility && onSelectFacility(f),
              }}
            >
              <Popup>
                <div className="text-gray-900 min-w-[200px]">
                  <h3 className="font-bold text-lg">{f.name}</h3>
                  <p className="text-sm my-1">{f.address}</p>
                  <button 
                    className="mt-2 bg-green-600 text-white w-full py-1 rounded text-sm font-semibold hover:bg-green-700"
                    onClick={() => onSelectFacility && onSelectFacility(f)}
                  >
                    Select This Facility
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-[1000] text-white">
          Loading Map Data...
        </div>
      )}
    </div>
  );
};

export default FacilityMap;