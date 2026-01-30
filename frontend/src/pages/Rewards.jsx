import React, { useState, useEffect } from "react";
import API from '../api/http';
import { useNavigate } from 'react-router-dom';

const rewards = [
  { id: 999, name: "Developer Test Voucher", pointsRequired: 10, category: "Test", img: "https://cdn-icons-png.flaticon.com/512/10434/10434252.png" },
  { id: 1, name: "Amazon Gift Card", pointsRequired: 500, category: "Shopping", img: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
  { id: 2, name: "Zomato Gold", pointsRequired: 300, category: "Food", img: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Zomato_Logo.svg" },
  { id: 3, name: "Uber Ride", pointsRequired: 600, category: "Travel", img: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" },
  { id: 4, name: "Flipkart Voucher", pointsRequired: 650, category: "Shopping", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEZkSig50hxAkM3tUe32a06WYkNbRHHlv9xw&s" },
  { id: 5, name: "Spotify Premium", pointsRequired: 700, category: "Music", img: "https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg" },
  { id: 6, name: "Netflix Month", pointsRequired: 1000, category: "Entertainment", img: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
  { id: 7, name: "Google Play", pointsRequired: 400, category: "Apps", img: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg" },
  { id: 8, name: "Domino's Pizza", pointsRequired: 650, category: "Food", img: "https://upload.wikimedia.org/wikipedia/commons/7/74/Dominos_pizza_logo.svg" },
  { id: 9, name: "Swiggy Money", pointsRequired: 300, category: "Food", img: "https://1000logos.net/wp-content/uploads/2021/05/Swiggy-logo.png" },
  { id: 10, name: "Paytm Cash", pointsRequired: 900, category: "Wallet", img: "https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" },
  { id: 12, name: "BigBasket", pointsRequired: 500, category: "Grocery", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTr3xOZrREto9WNjqxVOjZy4D7m7ByimftjKg&s" },
  { id: 13, name: "Myntra Fashion", pointsRequired: 750, category: "Fashion", img: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png" },
  { id: 14, name: "Starbucks Coffee", pointsRequired: 450, category: "Food", img: "https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg" },
  { id: 16, name: "YouTube Premium", pointsRequired: 800, category: "Entertainment", img: "https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg" },
  { id: 18, name: "BookMyShow", pointsRequired: 600, category: "Entertainment", img: "https://in.bmscdn.com/webin/common/icons/bms.svg" },
];

const Rewards = () => {
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [voucher, setVoucher] = useState(null); // Success Data
  const [confirmItem, setConfirmItem] = useState(null); // Item waiting for confirmation
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await API.get('/users/profile'); 
      setPoints(res.data.user.points);
    } catch (err) {
      console.error("Error fetching points:", err);
    } finally {
      setLoading(false);
    }
  };

  // 1. User Clicks Button -> Open Confirm Modal
  const initiateRedemption = (reward) => {
    if (points < reward.pointsRequired) return;
    setConfirmItem(reward);
  };

  // 2. User Clicks "Yes" -> Call API
  const handleConfirm = async () => {
    if (!confirmItem) return;
    setProcessing(true);

    try {
      const res = await API.post('/rewards/redeem', {
        cost: confirmItem.pointsRequired, 
        name: confirmItem.name
      });

      if (res.data.success) {
        setPoints(res.data.newBalance); 
        setVoucher({ name: confirmItem.name, code: res.data.code }); // Show Success Modal
        setConfirmItem(null); // Close Confirm Modal
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 pt-24 text-white text-center flex items-center justify-center">Loading Store...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pt-24">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 border-b border-gray-700 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-green-400">Rewards Store</h1>
          <p className="text-gray-400">Turn your eco-points into real value.</p>
        </div>
        
        <div className="flex gap-4 items-center">
            <div className="bg-gray-800 px-6 py-3 rounded-xl border border-blue-500 shadow-lg shadow-blue-900/20 text-center">
                <p className="text-gray-400 text-xs uppercase tracking-wider">Your Balance</p>
                <p className="text-3xl font-bold text-white">{points} <span className="text-sm text-gray-500">pts</span></p>
            </div>
            <button 
                onClick={() => navigate('/dashboard')}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-xl border border-gray-600 transition"
            >
                Back to Dashboard
            </button>
        </div>
      </div>

      {/* REWARDS GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rewards.map((item) => {
          const canAfford = points >= item.pointsRequired;
          const progress = Math.min((points / item.pointsRequired) * 100, 100);
          const missingPoints = item.pointsRequired - points;
          
          return (
            <div 
              key={item.id} 
              className={`bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700 flex flex-col transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl ${canAfford ? 'ring-1 ring-green-500/50' : 'opacity-90'}`}
            >
              {/* Image Area */}
              <div className="h-40 bg-white p-6 flex items-center justify-center relative">
                 <img src={item.img} alt={item.name} className="max-h-full max-w-full object-contain transform transition-transform hover:scale-110" />
                 <span className="absolute top-3 right-3 bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                   {item.category}
                 </span>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-white mb-1 leading-tight">{item.name}</h3>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-400">Cost:</span>
                    <span className="text-lg font-bold text-yellow-400">{item.pointsRequired} Pts</span>
                  </div>
                
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2.5 mb-1">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-500 ${canAfford ? 'bg-green-500' : 'bg-blue-600'}`} 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mb-4">
                    <span>{points} Pts</span>
                    <span>{item.pointsRequired} Pts</span>
                  </div>
                </div>
                
                {/* ACTION BUTTON - Opens Modal */}
                <button 
                  onClick={() => initiateRedemption(item)}
                  disabled={!canAfford}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                    canAfford 
                      ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white cursor-pointer' 
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
                  }`}
                >
                  {canAfford ? (
                    <><span>Redeem Now</span><span>➔</span></>
                  ) : (
                    `Need ${missingPoints} More`
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- MODAL 1: CONFIRMATION --- */}
      {confirmItem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
           <div className="bg-gray-800 p-8 rounded-2xl max-w-sm w-full border border-gray-600 shadow-2xl transform scale-100 transition-all">
              <h3 className="text-xl font-bold text-white mb-2">Confirm Redemption</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to spend <span className="text-yellow-400 font-bold">{confirmItem.pointsRequired} points</span> to get a <span className="text-white font-bold">{confirmItem.name}</span>?
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setConfirmItem(null)} // Cancel
                  className="flex-1 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirm} // Confirm
                  disabled={processing}
                  className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition shadow-lg flex justify-center items-center"
                >
                  {processing ? "Processing..." : "Confirm"}
                </button>
              </div>
           </div>
        </div>
      )}

      {/* --- MODAL 2: SUCCESS VOUCHER --- */}
      {voucher && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-800 p-8 rounded-2xl max-w-sm w-full text-center border-2 border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)] relative">
            <button 
              onClick={() => setVoucher(null)}
              className="absolute top-2 right-4 text-gray-400 hover:text-white text-2xl"
            >
              &times;
            </button>
            <div className="w-20 h-20 bg-green-900/30 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner border border-green-500/30">✓</div>
            <h2 className="text-2xl font-bold text-white mb-1">Redemption Success!</h2>
            <p className="text-gray-400 text-sm mb-6">You are now the owner of: <br/><span className="text-white font-bold">{voucher.name}</span></p>
            
            <div 
              className="bg-gray-900 p-5 rounded-xl border border-dashed border-gray-600 mb-6 relative group cursor-pointer hover:bg-gray-950 transition" 
              onClick={() => {
                navigator.clipboard.writeText(voucher.code);
              }}
            >
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Voucher Code</p>
              <p className="text-2xl font-mono text-yellow-400 font-bold tracking-widest select-all">{voucher.code}</p>
              <span className="absolute bottom-2 right-3 text-[10px] text-gray-600 group-hover:text-gray-400">Click to copy</span>
            </div>
            
            <button onClick={() => setVoucher(null)} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition shadow-lg">
              Close & Continue
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Rewards;