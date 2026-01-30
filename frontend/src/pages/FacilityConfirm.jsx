import React, { useState } from 'react';
import API from '../api/http';

const FacilityConfirm = () => {
  const [refNum, setRefNum] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleProcess = async (action) => {
    if (!refNum) return;
    setLoading(true);
    try {
      await API.post('/visit/confirm', { referenceNumber: refNum, action });
      setResult({ success: true, message: action === 'reject' ? 'Rejected' : 'Confirmed!' });
      if (action === 'approve') setRefNum('');
    } catch (err) {
      setResult({ success: false, message: err?.response?.data?.error || 'Failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pt-24 flex flex-col items-center">
      <div className="w-full max-w-lg bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <h1 className="text-2xl font-bold mb-2 text-center">Facility Console</h1>
        {result && <div className={`mb-6 p-4 rounded text-center font-bold ${result.success ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>{result.message}</div>}
        <input type="text" placeholder="REF NUMBER (e.g. TT-A1B2)" className="w-full p-4 mb-6 bg-gray-900 border border-gray-600 rounded-lg text-xl font-mono text-center tracking-widest uppercase" value={refNum} onChange={(e) => setRefNum(e.target.value.toUpperCase())} />
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => handleProcess('reject')} disabled={loading} className="py-4 rounded-lg font-bold bg-red-900 text-red-200 hover:bg-red-800">Reject</button>
          <button onClick={() => handleProcess('approve')} disabled={loading} className="py-4 rounded-lg font-bold bg-green-600 text-white hover:bg-green-500">Confirm</button>
        </div>
      </div>
    </div>
  );
};
export default FacilityConfirm;