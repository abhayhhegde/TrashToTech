// frontend/src/pages/RecyclePage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import API from '../api/http';
import { useNavigate } from 'react-router-dom';

// Fix default icon paths for leaflet if needed
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Haversine distance in km
const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Small component to capture map clicks and update parent
const LocationPicker = ({ setUserLocation }) => {
  useMapEvents({
    click(e) {
      setUserLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
};

const makeItemsPayload = (formData) => [
  {
    itemName: formData.itemName,
    category: formData.category.toLowerCase(),
    condition: formData.condition.toLowerCase(),
    weight: Number(formData.weight) || 0,
    quantity: 1
  }
];

const RecyclePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    weight: '',
    age: '',
    condition: ''
  });

  const [userLocation, setUserLocation] = useState(null); // {lat, lng}
  const [nearby, setNearby] = useState([]); // facilities with distance
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pointsInfo, setPointsInfo] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState(null);
  const [error, setError] = useState(null);
  const mapCenter = [12.97, 77.59]; // Bangalore center default
  const radiusMeters = 15000; // default search radius (15km)
  const mapRef = useRef();

  useEffect(() => {
    // if user has saved location in localStorage, prefill (optional)
    const saved = localStorage.getItem('recycle_user_location');
    if (saved) {
      try {
        const loc = JSON.parse(saved);
        if (loc && loc.lat && loc.lng) setUserLocation(loc);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      // save short-lived
      localStorage.setItem('recycle_user_location', JSON.stringify(userLocation));
    }
  }, [userLocation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateFormData = () => {
    const { itemName, category, weight, age, condition } = formData;
    return itemName && category && Number(weight) > 0 && age !== '' && condition;
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        // move map to this location
        if (mapRef.current) {
          mapRef.current.setView([pos.coords.latitude, pos.coords.longitude], 13);
        }
      },
      err => {
        setError('Unable to get your location — allow location access and try again.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const fetchNearbyFacilities = async (radius = radiusMeters) => {
    setError(null);
    if (!userLocation) {
      setError('Please pick a location on the map or use device location first.');
      return;
    }
    setLoadingNearby(true);
    try {
      // Prefer backend nearby query which uses $nearSphere
      const res = await API.get(`/api/facilities/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${radius}`);
      const facilities = res.data || [];
      // compute exact distances client-side (for display) and sort
      const withDist = facilities.map(f => {
        const coords = f.location?.coordinates || [0, 0];
        const [lng, lat] = coords;
        const distKm = haversineDistanceKm(userLocation.lat, userLocation.lng, lat, lng);
        return { ...f, distanceKm: Number(distKm.toFixed(2)) };
      }).sort((a, b) => a.distanceKm - b.distanceKm);
      setNearby(withDist);
      if (withDist.length) {
        setSelectedFacility(withDist[0]);
      } else {
        setSelectedFacility(null);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch nearby facilities.');
    } finally {
      setLoadingNearby(false);
    }
  };

  const handleSchedule = async () => {
    setError(null);
    if (!validateFormData()) {
      setError('Please complete the item details.');
      return;
    }
    if (!selectedFacility) {
      setError('Please select a facility from the list.');
      return;
    }
    setIsSubmitting(true);
    try {
      const items = makeItemsPayload(formData);
      const token = sessionStorage.getItem('authToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const payload = {
        items,
        facilityId: selectedFacility._id,
        userLocation
      };
      const resp = await API.post('/api/visit/schedule', payload, { headers });
      setPointsInfo({ estimatedPoints: resp.data.estimatedPoints, pendingPoints: resp.data.pendingPoints });
      setQrDataUrl(resp.data.qrDataUrl || null);
      setReferenceNumber(resp.data.referenceNumber || null);
      // optionally navigate to a details page or show modal
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || 'Failed to schedule visit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 mt-20">
      <h1 className="text-3xl font-bold mb-4">Recycle Your E-Waste</h1>

      {error && <div className="bg-red-700 p-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="font-semibold mb-2">Item Details</h2>

          <label className="block text-sm mt-2">Item Name</label>
          <input name="itemName" value={formData.itemName} onChange={handleInputChange} className="w-full p-2 bg-gray-700 rounded" />

          <label className="block text-sm mt-2">Category</label>
          <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-2 bg-gray-700 rounded">
            <option value="">Select</option>
            <option>Smartphone</option>
            <option>Laptop</option>
            <option>Tablet</option>
            <option>Other</option>
          </select>

          <label className="block text-sm mt-2">Weight (kg)</label>
          <input name="weight" type="number" value={formData.weight} onChange={handleInputChange} className="w-full p-2 bg-gray-700 rounded" />

          <label className="block text-sm mt-2">Age (years)</label>
          <input name="age" type="number" value={formData.age} onChange={handleInputChange} className="w-full p-2 bg-gray-700 rounded" />

          <label className="block text-sm mt-2">Condition</label>
          <select name="condition" value={formData.condition} onChange={handleInputChange} className="w-full p-2 bg-gray-700 rounded">
            <option value="">Select</option>
            <option>Good</option>
            <option>Moderate</option>
            <option>Poor</option>
          </select>

          <div className="mt-4 flex gap-2">
            <button onClick={useMyLocation} className="bg-blue-600 px-3 py-2 rounded hover:bg-blue-700">Use my location</button>
            <button onClick={() => {
              // center map on Bangalore if no location
              if (mapRef.current) mapRef.current.setView(mapCenter, 11);
            }} className="bg-gray-600 px-3 py-2 rounded hover:bg-gray-500">Reset map</button>
            <button onClick={() => fetchNearbyFacilities(radiusMeters)} className="ml-auto bg-green-600 px-3 py-2 rounded hover:bg-green-700">Find Nearby</button>
          </div>

          <div className="mt-3 text-sm text-gray-300">
            Tip: Click on the map to choose a pickup location manually, or click "Use my location".
          </div>

          <div className="mt-4">
            <button disabled={isSubmitting} onClick={handleSchedule} className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700">
              {isSubmitting ? 'Scheduling...' : 'Schedule & Get Points'}
            </button>
          </div>

          {pointsInfo && (
            <div className="mt-4 bg-gray-700 p-3 rounded">
              <div>Estimated points: <strong>{pointsInfo.estimatedPoints}</strong></div>
              <div>Pending (credited now): <strong>{pointsInfo.pendingPoints}</strong></div>
              {referenceNumber && <div>Ref: <strong>{referenceNumber}</strong></div>}
              {qrDataUrl && <div className="mt-2"><img src={qrDataUrl} alt="QR" style={{ width: 140 }} /></div>}
            </div>
          )}
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="font-semibold mb-2">Pick Location & Choose Facility</h2>

          <div className="w-full h-80 mb-3">
            <MapContainer
              center={userLocation ? [userLocation.lat, userLocation.lng] : mapCenter}
              zoom={userLocation ? 13 : 11}
              style={{ height: '100%', width: '100%' }}
              whenCreated={mapInstance => { mapRef.current = mapInstance; }}
            >
              <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker setUserLocation={setUserLocation} />
              {/* show user-chosen location */}
              {userLocation && (
                <>
                  <Marker position={[userLocation.lat, userLocation.lng]}>
                    <Popup>You selected this location</Popup>
                  </Marker>
                  <Circle center={[userLocation.lat, userLocation.lng]} radius={radiusMeters} pathOptions={{ color: '#29b6f6', opacity: 0.3 }} />
                </>
              )}

              {/* show facility markers */}
              {nearby.map(f => {
                const coords = f.location?.coordinates;
                if (!coords) return null;
                const [lng, lat] = coords;
                return (
                  <Marker key={f._id} position={[lat, lng]} eventHandlers={{
                    click: () => setSelectedFacility(f)
                  }}>
                    <Popup>
                      <div style={{ minWidth: 180 }}>
                        <strong>{f.name}</strong><br />
                        <small>{f.address}</small><br />
                        <div>Distance: {f.distanceKm ?? 'N/A'} km</div>
                        <div style={{ marginTop: 6 }}>
                          <button onClick={() => setSelectedFacility(f)} className="bg-green-600 px-2 py-1 rounded text-sm mt-2">Select this facility</button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          <div className="space-y-2 max-h-72 overflow-auto">
            {loadingNearby ? <div>Loading nearby facilities…</div> : (
              nearby.length === 0 ? <div className="text-gray-400">No facilities loaded. Click 'Find Nearby' after choosing location.</div> :
                nearby.map(f => (
                  <div key={f._id} className={`p-3 rounded ${selectedFacility && selectedFacility._id === f._id ? 'bg-green-700' : 'bg-gray-700'}`}>
                    <div className="flex justify-between">
                      <div>
                        <div className="font-semibold">{f.name}</div>
                        <div className="text-xs text-gray-300">{f.address}</div>
                        <div className="text-xs text-gray-400">Capacity: {f.capacity ?? 'N/A'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{f.distanceKm} km</div>
                        <button onClick={() => setSelectedFacility(f)} className="mt-2 bg-indigo-600 px-2 py-1 rounded text-sm">Choose</button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecyclePage;
