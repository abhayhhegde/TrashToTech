const basePoints = {
  smartphone: 50,
  laptop: 150,
  tablet: 75,
  desktop: 200,
  charger: 10,
  battery: 30,
  other: 10
};

const conditionMultiplier = {
  good: 1.5,
  moderate: 1.2,
  poor: 1.0
};

function calcPointsForItem(item) {
  const typeKey = item.category ? item.category.toLowerCase() : 'other';
  const base = basePoints[typeKey] || basePoints.other;
  const condKey = (item.condition || 'poor').toLowerCase();
  const mult = conditionMultiplier[condKey] || 1.0;
  const qty = item.quantity ? Number(item.quantity) : 1;
  return Math.round(base * mult * qty);
}

function calculateEstimatedPoints(items = []) {
  let total = 0;
  for (const it of items) total += calcPointsForItem(it);
  return total;
}

module.exports = { calculateEstimatedPoints, calcPointsForItem };