// src/utils/levelLogic.js

export const getLevel = (totalPoints) => {
  // Logic:
  // 1 Smartphone (Good) = 75 pts
  // 1 Laptop (Good) = 225 pts

  if (totalPoints >= 5000) {
    return { 
      name: "♻️ Platinum Guardian", 
      color: "text-cyan-400", 
      borderColor: "border-cyan-500",
      description: "You are an e-waste hero!" 
    };
  }
  
  if (totalPoints >= 2000) {
    return { 
      name: "🥇 Gold Recycler", 
      color: "text-yellow-400", 
      borderColor: "border-yellow-500",
      description: "Amazing impact!" 
    };
  }
  
  if (totalPoints >= 500) {
    return { 
      name: "🥈 Silver Saver", 
      color: "text-gray-300", 
      borderColor: "border-gray-400",
      description: "Solid effort! " 
    };
  }
  
  if (totalPoints >= 100) {
    return { 
      name: "🥉 Bronze Starter", 
      color: "text-orange-400", 
      borderColor: "border-orange-500",
      description: "Good start! " 
    };
  }

  return { 
    name: "🌱 Eco-Novice", 
    color: "text-green-400", 
    borderColor: "border-green-500",
    description: "Recycle your first item to rank up!" 
  };
};

export const getNextLevelProgress = (points) => {
  if (points >= 5000) return 100; 
  if (points >= 2000) return ((points - 2000) / 3000) * 100; 
  if (points >= 500) return ((points - 500) / 1500) * 100;  
  if (points >= 100) return ((points - 100) / 400) * 100;   
  return (points / 100) * 100;                               
};