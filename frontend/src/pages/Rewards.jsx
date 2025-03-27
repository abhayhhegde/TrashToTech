// pages/Rewards.jsx

import React from "react";

// Define your rewards here
const rewards = [
  { id: 1, name: "Amazon Gift Voucher (₹100)", description: "Get ₹100 off on your next Amazon purchase.", pointsRequired: 500 },
  { id: 2, name: "50% Discount on Zomato/Swiggy", description: "Enjoy 50% off on your next Zomato or Swiggy order.", pointsRequired: 300 },
  { id: 3, name: "₹200 Uber Ride Voucher", description: "Get ₹200 off on your next Uber ride.", pointsRequired: 600 },
  { id: 4, name: "Flipkart Gift Voucher (₹150)", description: "Avail ₹150 off on your next Flipkart order.", pointsRequired: 650 },
  { id: 5, name: "Spotify Premium (1 Month)", description: "Get 1 month of Spotify Premium subscription.", pointsRequired: 700 },
  { id: 6, name: "Netflix Subscription (1 Month)", description: "Enjoy 1 month of Netflix subscription.", pointsRequired: 1000 },
  { id: 7, name: "₹50 Google Play Credit", description: "Get ₹50 credit in your Google Play account.", pointsRequired: 400 },
  { id: 8, name: "Domino's ₹200 Voucher", description: "Enjoy ₹200 off on your next Domino's order.", pointsRequired: 650 },
  { id: 9, name: "Swiggy ₹100 Voucher", description: "Get ₹100 off on your next Swiggy order.", pointsRequired: 300 },
  { id: 10, name: "₹250 Paytm Cash", description: "Get ₹250 in your Paytm wallet.", pointsRequired: 900 },
  { id: 11, name: "Free Hotstar Subscription (1 Month)", description: "Enjoy 1 month of free Hotstar subscription.", pointsRequired: 800 },
  { id: 12, name: "BigBasket ₹150 Voucher", description: "Get ₹150 off on your next BigBasket order.", pointsRequired: 500 },
  { id: 13, name: "Myntra ₹300 Voucher", description: "Get ₹300 off on your next Myntra order.", pointsRequired: 750 },
  { id: 14, name: "₹150 Starbucks Voucher", description: "Enjoy ₹150 off at Starbucks.", pointsRequired: 450 },
  { id: 15, name: "Ola ₹200 Ride Credit", description: "Get ₹200 off on your next Ola ride.", pointsRequired: 500 },
  { id: 16, name: "YouTube Premium (1 Month)", description: "Enjoy ad-free YouTube for 1 month.", pointsRequired: 800 },
  { id: 17, name: "₹100 Pizza Hut Voucher", description: "Get ₹100 off on your next Pizza Hut order.", pointsRequired: 400 },
  { id: 18, name: "Uber Eats ₹150 Voucher", description: "Enjoy ₹150 off on your next Uber Eats order.", pointsRequired: 500 },
  { id: 19, name: "H&M ₹250 Voucher", description: "Get ₹250 off on your next H&M purchase.", pointsRequired: 850 },
  { id: 20, name: "BookMyShow ₹200 Voucher", description: "Get ₹200 off on your next movie ticket.", pointsRequired: 600 },
];

const Rewards = ({ points = 500, setPoints, setMessage }) => {
  // Function to redeem a reward
  const redeemReward = (reward) => {
    if (points >= reward.pointsRequired) {
      setPoints(points - reward.pointsRequired);
      setMessage(`You have successfully redeemed: ${reward.name}`);
    } else {
      setMessage("Insufficient points to redeem this reward.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-5">
      <h2 className="text-2xl mb-8">Reward Store</h2>
      
      {/* Enhanced Points Display */}
      <div className="bg-gray-800 p-5 rounded-lg shadow-lg mb-4">
        <p className="text-xl mb-2 ">Your Points:</p>
        <p className="text-4xl font-bold text-blue-400">{points}</p>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => (
          <div key={reward.id} className="voucher-box bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 mb-4">
            <h3 className="text-lg font-bold">{reward.name}</h3>
            <p className="text-sm">{reward.description}</p>
            <p><strong>{reward.pointsRequired} Points</strong></p>
            <button 
              className="redeem-button bg-blue-500 text-white p-2 rounded w-full mt-2 hover:bg-blue-600" 
              onClick={() => redeemReward(reward)}
            >
              Redeem
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rewards;
