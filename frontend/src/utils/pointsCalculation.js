// frontend/src/utils/pointcalculations.js

export const basePoints = {
  // --- TIER 1: HIGH VALUE (Gold/Lithium Rich) ---
  laptop: 600,         
  smartphone: 250,     
  tablet: 300,         
  smartwatch: 150,     
  camera: 200,         
  drone: 400,          

  // --- TIER 2: MEDIUM VALUE (Copper/Aluminum Rich) ---
  desktop: 500,     
  monitor: 200,    
  console: 250,        
  printer: 150,        
  scanner: 150,
  projector: 200,
  router: 100,         
  server: 800,         

  // --- TIER 3: APPLIANCES (Heavy Metal) ---
  fridge: 800,         
  ac_unit: 900,        
  washing_machine: 600,
  microwave: 300,      
  television: 250,     

  // --- TIER 4: ACCESSORIES (Low Value) ---
  hdd_ssd: 80,         
  ram: 40,       
  gpu: 150,  
  power_bank: 100,     
  keyboard: 30,        
  mouse: 20,           
  headphones: 40,      
  charger: 15,         
  cable: 10,           
  battery: 10,   

  // --- TIER 5: SPECIAL ---
  other: 20            
};

export const conditionMultiplier = {
  good: 1.2,      // Reusable (High Eco Value)
  moderate: 1.0,  // Standard Recycling
  poor: 0.8       // Scrap Extraction
};

// Main Calculation Function
export function calcPointsForItem(item) {
  // Normalize key: 'Desktop PC' -> 'desktop'
  let typeKey = item.category ? item.category.toLowerCase().replace(/\s+/g, '_') : 'other';
  
  // Fallback to 'other' if category not found
  if (!basePoints[typeKey]) typeKey = 'other';

  const base = basePoints[typeKey];
  const condKey = (item.condition || 'poor').toLowerCase();
  const mult = conditionMultiplier[condKey] || 1.0;
  const qty = item.quantity ? Number(item.quantity) : 1;
  
  return Math.round(base * mult * qty);
}

export function calculateEstimatedPoints(items = []) {
  let total = 0;
  for (const it of items) total += calcPointsForItem(it);
  return total;
}