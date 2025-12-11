// src/pages/AdminConfirm.jsx
import React, { useState } from 'react';
import API from '../api/http';

const AdminConfirm = () => {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [action, setAction] = useState('accept');
  const [actualItemsJson, setActualItemsJson] = useState('[]');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!referenceNumber) {
      setMessage('Enter reference number.');
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
      const resp = await API.post('/api/visit/confirm', { referenceNumber, action, actualItems });
      setMessage('Success: ' + (resp.data.message || JSON.stringify(resp.data)));
    } catch (err) {
      console.error('confirm err', err);
      setMessage('Error: ' + (err?.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 mt-20">
      <div className="max-w-2xl mx-auto bg-gray-800 p-6 rounded">
        <h1 className="text-2xl mb-4">Admin — Confirm Visit</h1>

        <div className="mb-3">
          <label className="block mb-2">Reference Number</label>
          <input value={referenceNumber} onChange={(e)=>setReferenceNumber(e.target.value)}
            className="p-2 bg-gray-700 rounded w-full" placeholder="Enter reference from QR" />
        </div>

        <div className="mb-3">
          <label className="block mb-2">Action</label>
          <select value={action} onChange={(e)=>setAction(e.target.value)} className="p-2 bg-gray-700 rounded w-full">
            <option value="accept">Accept (award remaining)</option>
            <option value="reject">Reject (remove initial credit)</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="block mb-2">Actual Items (JSON)</label>
          <textarea value={actualItemsJson} onChange={(e)=>setActualItemsJson(e.target.value)}
            className="p-2 bg-gray-700 rounded w-full h-40"
            placeholder='[{"itemName":"Phone","category":"smartphone","condition":"good","quantity":1}]' />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={submit} className="bg-green-600 px-4 py-2 rounded" disabled={loading}>
            {loading ? 'Processing...' : 'Submit'}
          </button>
        </div>

        {message && <p className="mt-4">{message}</p>}
      </div>
    </div>
  );
};

export default AdminConfirm;
