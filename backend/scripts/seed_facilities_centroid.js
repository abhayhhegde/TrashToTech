require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Facility = require('../models/Facility'); // Ensure this path matches your structure

// 1. Point to the specific file
const DATA_FILE = path.join(__dirname, '..', 'data', 'bangalore_with_centroids.json');

async function run() {
  try {
    // 2. Read Data
    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(rawData);

    // 3. Connect to the REPLICA SET DB (The one running in your other terminal)
    // Note: We use 127.0.0.1 to avoid localhost IPV6 issues
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trash_to_tech', {
      directConnection: true 
    });
    console.log('🔌 Connected to MongoDB...');

    let count = 0;

    for (const item of data) {
      // 4. Skip entries without valid coordinates
      if (!item.location || !item.location.coordinates || item.location.coordinates.length !== 2) {
        console.log(`⚠️  Skipping ${item.name} (No coordinates)`);
        continue;
      }

      // 5. Check for duplicates
      const exists = await Facility.findOne({ name: item.name });
      if (exists) {
        console.log(`⏭️  Skipping ${item.name} (Already exists)`);
        continue;
      }

      // 6. Format for the New Schema
      const doc = {
        name: item.name,
        address: item.address,
        // Ensure Operating Hours exists or default it
        operatingHours: item.operatingHours || 'Mon-Sat: 10:00 AM - 6:00 PM', 
        contactInfo: item.contactInfo || 'Contact Facility',
        // Convert capacity to string if needed, or number
        acceptedItems: ['laptop', 'smartphone', 'tablet', 'other'], // Default items if missing
        status: 'active',
        location: {
          type: 'Point',
          coordinates: item.location.coordinates // [Lng, Lat]
        }
      };

      await Facility.create(doc);
      console.log(`✅ Inserted: ${item.name}`);
      count++;
    }

    console.log(`\n🎉 Done! Seeded ${count} new facilities.`);
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

run();