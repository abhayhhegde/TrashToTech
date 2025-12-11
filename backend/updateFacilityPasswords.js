// backend/updateFacilityPasswords.js
// Script to add hashed passwords to existing facilities

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const Facility = require('./models/Facility');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/trash_to_tech';
const DEFAULT_PASSWORD = 'admin123';

async function updateFacilityPasswords() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Get all facilities
    const facilities = await Facility.find({});
    console.log(`Found ${facilities.length} facilities`);

    if (facilities.length === 0) {
      console.log('No facilities found. Please run seedFacilities.js first.');
      process.exit(0);
    }

    // Hash the default password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, salt);

    let updated = 0;
    let skipped = 0;

    for (const facility of facilities) {
      // Generate email from facility name if not exists
      if (!facility.email) {
        const emailName = facility.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .substring(0, 30);
        facility.email = `${emailName}@facility.trastotech.com`;
      }

      // Set password if not exists
      if (!facility.passwordHash) {
        facility.passwordHash = passwordHash;
        await facility.save();
        console.log(`✓ Updated: ${facility.name} - Email: ${facility.email}`);
        updated++;
      } else {
        console.log(`- Skipped: ${facility.name} (already has password)`);
        skipped++;
      }
    }

    console.log(`\n=== Update Complete ===`);
    console.log(`Updated: ${updated} facilities`);
    console.log(`Skipped: ${skipped} facilities`);
    console.log(`\nDefault password for all facilities: ${DEFAULT_PASSWORD}`);
    console.log(`\nFacility emails:`);

    const allFacilities = await Facility.find({}).select('name email').lean();
    allFacilities.forEach(f => {
      console.log(`  - ${f.name}: ${f.email}`);
    });

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error updating facility passwords:', error);
    process.exit(1);
  }
}

updateFacilityPasswords();
