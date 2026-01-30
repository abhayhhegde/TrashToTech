require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Facility = require('../models/Facility');

// ⚠️ Check your spelling: is the file 'bangalore...' or 'banglore...'?
// I am using the standard spelling below. Update if your file is different.
const DATA_FILE = path.join(__dirname, '..', 'data', 'bangalore_with_centroids.json');

async function run() {
  try {
    // 1. Connect to Database
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trash_to_tech');
    
    // 2. CRITICAL STEP: Delete all existing facilities
    console.log('💥 Deleting ALL existing facilities (Cleaning bad data)...');
    await Facility.deleteMany({});
    console.log('🧹 Database cleared.');

    // 3. Read the JSON file
    if (!fs.existsSync(DATA_FILE)) {
        throw new Error(`❌ Data file not found at: ${DATA_FILE}`);
    }
    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(rawData);

    // 4. Insert Good Data
    let count = 0;
    for (const item of data) {
      // Ensure coordinates exist
      if (item.location && item.location.coordinates) {
         await Facility.create({
            name: item.name,
            address: item.address,
            capacity: item.capacity,
            operatingHours: 'Mon-Sat: 10:00 AM - 6:00 PM', // Default
            contactInfo: '080-12345678', // Default
            acceptedItems: ['laptop', 'smartphone', 'electronics'],
            status: 'active',
            // Map the coordinates from JSON
            location: {
                type: 'Point',
                coordinates: item.location.coordinates // [Longitude, Latitude]
            }
         });
         process.stdout.write('.'); // Show progress
         count++;
      }
    }

    console.log(`\n\n✅ SUCCESS: Added ${count} facilities to the map!`);
    process.exit(0);

  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    process.exit(1);
  }
}

run();