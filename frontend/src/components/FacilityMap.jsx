// frontend/src/components/FacilityMap.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import API from '../api/http';

// fix default marker icons (Leaflet default image path issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const FacilityMap = ({ center = [12.97, 77.59], zoom = 11 }) => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await API.get('/api/facilities');
        setFacilities(res.data || []);
      } catch (err) {
        console.error('Failed load facilities', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="w-full h-[80vh]">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {facilities.map((f) => {
          const coords = (f.location && f.location.coordinates) || null;
          if (!coords) return null;
          const [lng, lat] = coords;
          return (
            <Marker key={f._id} position={[lat, lng]}>
              <Popup>
                <div style={{ minWidth: 200 }}>
                  <strong>{f.name}</strong>
                  <div style={{ fontSize: 12, marginTop: 6 }}>{f.address}</div>
                  <div style={{ marginTop: 6 }}>Capacity: {f.capacity ?? 'N/A'}</div>
                  <div style={{ marginTop: 4, fontSize: 11, color: '#666' }}>Source: {f.source || 'CPCB'}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      {loading && <div className="text-center mt-2 text-gray-400">Loading facilities…</div>}
    </div>
  );
};

export default FacilityMap;
