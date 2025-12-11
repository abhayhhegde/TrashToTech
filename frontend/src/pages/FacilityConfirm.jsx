// src/pages/FacilityConfirm.jsx
import React, { useState, useRef } from 'react';
import API from '../api/http';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

const FacilityConfirm = () => {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [action, setAction] = useState('accept');
  const [visitDetails, setVisitDetails] = useState(null);
  const [actualItemsJson, setActualItemsJson] = useState('[]');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  // Check if facility is logged in
  React.useEffect(() => {
    const facilityToken = sessionStorage.getItem('facilityToken');
    if (!facilityToken) {
      navigate('/facility/login');
    }
  }, [navigate]);

  const fetchVisitDetails = async (refNum) => {
    try {
      setLoading(true);
      const response = await API.get(`/api/visit/details/${refNum}`);
      setVisitDetails(response.data);

      // Pre-fill actual items from scheduled items
      const itemsForJson = response.data.items.map(item => ({
        itemName: item.itemName,
        category: item.category,
        condition: item.condition,
        weight: item.weight,
        quantity: item.quantity || 1
      }));
      setActualItemsJson(JSON.stringify(itemsForJson, null, 2));
      setMessage('');
    } catch (err) {
      console.error('Fetch visit error:', err);
      setMessage('Error: ' + (err?.response?.data?.error || 'Visit not found'));
      setVisitDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReferenceChange = (e) => {
    const value = e.target.value;
    setReferenceNumber(value);

    // Auto-fetch when reference number looks complete (e.g., TT-XXXXXXXX)
    if (value.match(/^TT-[A-F0-9]{8}$/i)) {
      fetchVisitDetails(value);
    }
  };

  const startQRScanner = () => {
    setScanning(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner('qr-reader', {
        qrbox: { width: 250, height: 250 },
        fps: 10
      });

      scanner.render(
        (decodedText) => {
          // Stop scanning
          scanner.clear();
          setScanning(false);

          try {
            // Parse QR code data
            const qrData = JSON.parse(decodedText);
            if (qrData.referenceNumber) {
              setReferenceNumber(qrData.referenceNumber);
              fetchVisitDetails(qrData.referenceNumber);
            } else {
              setMessage('Invalid QR code format');
            }
          } catch (err) {
            setMessage('Error parsing QR code');
          }
        },
        (error) => {
          console.log('QR scan error:', error);
        }
      );

      scannerRef.current = scanner;
    }, 100);
  };

  const stopQRScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    setScanning(false);
  };

  const submit = async () => {
    if (!referenceNumber) {
      setMessage('Enter reference number or scan QR code.');
      return;
    }

    let actualItems = [];
    try {
      actualItems = JSON.parse(actualItemsJson || '[]');
    } catch (e) {
      setMessage('Actual items JSON is invalid.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const facilityToken = sessionStorage.getItem('facilityToken');
      const resp = await API.post(
        '/api/visit/confirm',
        { referenceNumber, action, actualItems },
        { headers: { Authorization: `Bearer ${facilityToken}` } }
      );

      setMessage('Success: ' + (resp.data.message || JSON.stringify(resp.data)));
      setVisitDetails(null);
      setReferenceNumber('');
      setActualItemsJson('[]');
    } catch (err) {
      console.error('confirm err', err);
      setMessage('Error: ' + (err?.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const facilityName = sessionStorage.getItem('facilityName');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 mt-20">
      <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Facility - Confirm Visit</h1>
            {facilityName && <p className="text-gray-400 text-sm">Logged in as: {facilityName}</p>}
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem('facilityToken');
              sessionStorage.removeItem('facilityName');
              sessionStorage.removeItem('facilityEmail');
              sessionStorage.removeItem('facilityId');
              navigate('/facility/login');
            }}
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* QR Scanner Section */}
        <div className="mb-6 p-4 bg-gray-700 rounded">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Scan QR Code or Enter Reference</h3>
            {!scanning ? (
              <button
                onClick={startQRScanner}
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
              >
                Start QR Scanner
              </button>
            ) : (
              <button
                onClick={stopQRScanner}
                className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
              >
                Stop Scanner
              </button>
            )}
          </div>

          {scanning && (
            <div id="qr-reader" className="mb-4"></div>
          )}

          <div>
            <label className="block mb-2">Reference Number</label>
            <input
              value={referenceNumber}
              onChange={handleReferenceChange}
              className="p-2 bg-gray-600 rounded w-full"
              placeholder="Enter reference from QR (e.g., TT-A1B2C3D4)"
            />
          </div>
        </div>

        {/* Visit Details Section */}
        {visitDetails && (
          <div className="mb-6 p-4 bg-gray-700 rounded">
            <h3 className="text-lg font-semibold mb-3">Visit Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Reference:</span>{' '}
                <span className="font-bold">{visitDetails.referenceNumber}</span>
              </div>
              <div>
                <span className="text-gray-400">Status:</span>{' '}
                <span className={`px-2 py-1 rounded ${
                  visitDetails.status === 'scheduled' ? 'bg-yellow-700' :
                  visitDetails.status === 'completed' ? 'bg-green-700' :
                  'bg-red-700'
                }`}>
                  {visitDetails.status}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Email:</span> {visitDetails.email || 'N/A'}
              </div>
              <div>
                <span className="text-gray-400">Scheduled:</span>{' '}
                {new Date(visitDetails.scheduledAt).toLocaleString()}
              </div>
              <div>
                <span className="text-gray-400">Estimated Points:</span> {visitDetails.estimatedPoints}
              </div>
              <div>
                <span className="text-gray-400">Pending Points:</span> {visitDetails.pendingPoints}
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold mb-2">Scheduled Items:</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left pb-2">Item</th>
                    <th className="text-left pb-2">Category</th>
                    <th className="text-left pb-2">Condition</th>
                    <th className="text-left pb-2">Weight (kg)</th>
                    <th className="text-left pb-2">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {visitDetails.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-600">
                      <td className="py-2">{item.itemName}</td>
                      <td>{item.category}</td>
                      <td>{item.condition}</td>
                      <td>{item.weight}</td>
                      <td>{item.quantity || 1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Selection */}
        <div className="mb-4">
          <label className="block mb-2">Action</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="p-2 bg-gray-700 rounded w-full"
          >
            <option value="accept">Accept (award remaining points)</option>
            <option value="reject">Reject (remove initial credit)</option>
          </select>
        </div>

        {/* Actual Items JSON */}
        <div className="mb-4">
          <label className="block mb-2">Actual Items Received (JSON)</label>
          <p className="text-xs text-gray-400 mb-2">
            Modify if actual items differ from scheduled. Format: array of objects with itemName, category, condition, weight, quantity
          </p>
          <textarea
            value={actualItemsJson}
            onChange={(e) => setActualItemsJson(e.target.value)}
            className="p-2 bg-gray-700 rounded w-full h-64 font-mono text-sm"
            placeholder='[{"itemName":"Phone","category":"smartphone","condition":"good","weight":0.2,"quantity":1}]'
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={submit}
            className="bg-green-600 px-6 py-2 rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm & Submit'}
          </button>

          {visitDetails && (
            <button
              onClick={() => {
                setVisitDetails(null);
                setReferenceNumber('');
                setActualItemsJson('[]');
                setMessage('');
              }}
              className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mt-4 p-3 rounded ${
            message.includes('Success') ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilityConfirm;
