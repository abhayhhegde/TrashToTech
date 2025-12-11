// backend/scripts/seed_facilities_centroid.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Facility = require('../models/Facility');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/trash_to_tech';
const DATA_FILE = path.join(__dirname, '..', 'data', 'bangalore_with_centroids.json');

async function run() {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  for (const item of data) {
    // Skip if already exists by exact name+address
    const exists = await Facility.findOne({ name: item.name, address: item.address });
    if (exists) {
      console.log('skip exists', item.name);
      continue;
    }

    const doc = {
      name: item.name,
      address: item.address,
      capacity: item.capacity || null,
      acceptedItems: item.acceptedItems || [],
      operatingHours: item.operatingHours || '',
      contactInfo: item.contactInfo || '',
      certifications: item.certifications || [],
      rating: item.rating || 4,
      status: 'active',
      source: item.source || 'CPCB',
      location: item.location || { type: 'Point', coordinates: [0, 0] }
    };

    await Facility.create(doc);
    console.log('inserted', item.name);
  }

  await mongoose.disconnect();
  console.log('done seeding facilities');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
