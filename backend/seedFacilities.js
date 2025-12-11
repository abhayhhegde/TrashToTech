// backend/seedFacilities.js
// Script to seed the database with sample e-waste recycling facilities

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Facility = require('./models/Facility');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/trash_to_tech';

// Sample facilities across major Indian cities (Bangalore focus)
const sampleFacilities = [
  // Bangalore facilities
  {
    name: 'E-Parisaraa Pvt Ltd',
    address: 'Dobbaspet Industrial Area, Bangalore North, Karnataka 561203',
    location: {
      type: 'Point',
      coordinates: [77.4101, 13.2846]
    },
    capacity: 5000,
    acceptedItems: ['Smartphones', 'Laptops', 'Tablets', 'Desktop Computers', 'Monitors', 'Keyboards', 'Printers'],
    operatingHours: 'Mon-Sat: 9:00 AM - 6:00 PM',
    contactInfo: '+91-80-2771-8491',
    certifications: ['CPCB Authorized', 'ISO 14001', 'R2 Certified'],
    rating: 4.5,
    status: 'active',
    source: 'CPCB'
  },
  {
    name: 'Saahas Zero Waste',
    address: '1st Cross, 80 Feet Road, Koramangala, Bangalore, Karnataka 560034',
    location: {
      type: 'Point',
      coordinates: [77.6082, 12.9352]
    },
    capacity: 3000,
    acceptedItems: ['Smartphones', 'Tablets', 'Laptops', 'Cables', 'Chargers', 'Small Electronics'],
    operatingHours: 'Mon-Sat: 10:00 AM - 7:00 PM',
    contactInfo: '+91-80-4112-6629',
    certifications: ['CPCB Authorized', 'ISO 14001'],
    rating: 4.3,
    status: 'active',
    source: 'CPCB'
  },
  {
    name: 'Attero Recycling',
    address: 'Electronic City Phase 1, Bangalore, Karnataka 560100',
    location: {
      type: 'Point',
      coordinates: [77.6648, 12.8456]
    },
    capacity: 8000,
    acceptedItems: ['All Electronics', 'Batteries', 'Circuit Boards', 'Industrial E-Waste'],
    operatingHours: 'Mon-Fri: 9:00 AM - 5:00 PM',
    contactInfo: '+91-120-4003-500',
    certifications: ['CPCB Authorized', 'ISO 14001', 'ISO 9001', 'OHSAS 18001'],
    rating: 4.7,
    status: 'active',
    source: 'CPCB'
  },
  {
    name: 'TES-AMM India',
    address: 'Peenya Industrial Area, Bangalore, Karnataka 560058',
    location: {
      type: 'Point',
      coordinates: [77.5158, 13.0358]
    },
    capacity: 6000,
    acceptedItems: ['IT Equipment', 'Servers', 'Networking Equipment', 'Consumer Electronics'],
    operatingHours: 'Mon-Sat: 9:30 AM - 6:30 PM',
    contactInfo: '+91-80-4225-8000',
    certifications: ['CPCB Authorized', 'R2 Certified', 'ISO 14001'],
    rating: 4.4,
    status: 'active',
    source: 'CPCB'
  },
  {
    name: 'Greenscape Eco Management',
    address: 'Whitefield, Bangalore, Karnataka 560066',
    location: {
      type: 'Point',
      coordinates: [77.7499, 12.9698]
    },
    capacity: 4000,
    acceptedItems: ['Smartphones', 'Laptops', 'Tablets', 'TVs', 'Refrigerators', 'Air Conditioners'],
    operatingHours: 'Mon-Sat: 10:00 AM - 6:00 PM',
    contactInfo: '+91-80-6754-3210',
    certifications: ['CPCB Authorized', 'ISO 14001'],
    rating: 4.2,
    status: 'active',
    source: 'CPCB'
  },
  {
    name: 'Eco Recycling Ltd',
    address: 'JP Nagar, Bangalore, Karnataka 560078',
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9010]
    },
    capacity: 2500,
    acceptedItems: ['Laptops', 'Desktops', 'Monitors', 'Printers', 'Scanners'],
    operatingHours: 'Tue-Sun: 10:00 AM - 7:00 PM',
    contactInfo: '+91-80-2659-8741',
    certifications: ['CPCB Authorized'],
    rating: 4.0,
    status: 'active',
    source: 'CPCB'
  },
  {
    name: 'ReCircle E-Waste Solutions',
    address: 'Indiranagar, Bangalore, Karnataka 560038',
    location: {
      type: 'Point',
      coordinates: [77.6408, 12.9716]
    },
    capacity: 3500,
    acceptedItems: ['All Consumer Electronics', 'Home Appliances', 'Mobile Phones'],
    operatingHours: 'Mon-Sat: 9:00 AM - 6:00 PM',
    contactInfo: '+91-80-4152-7890',
    certifications: ['CPCB Authorized', 'ISO 14001'],
    rating: 4.6,
    status: 'active',
    source: 'CPCB'
  },
  {
    name: 'Chintan Environmental Research',
    address: 'HSR Layout, Bangalore, Karnataka 560102',
    location: {
      type: 'Point',
      coordinates: [77.6387, 12.9121]
    },
    capacity: 2000,
    acceptedItems: ['Smartphones', 'Tablets', 'Small Electronics', 'Batteries'],
    operatingHours: 'Mon-Fri: 10:00 AM - 5:00 PM',
    contactInfo: '+91-80-4198-6543',
    certifications: ['CPCB Authorized'],
    rating: 4.1,
    status: 'active',
    source: 'CPCB'
  },

  // Delhi facilities
  {
    name: 'Namo eWaste Management',
    address: 'Bawana Industrial Area, Delhi 110039',
    location: {
      type: 'Point',
      coordinates: [77.0386, 28.7955]
    },
    capacity: 10000,
    acceptedItems: ['All Electronics', 'Industrial E-Waste', 'Batteries', 'PCBs'],
    operatingHours: 'Mon-Sat: 9:00 AM - 6:00 PM',
    contactInfo: '+91-11-4567-8901',
    certifications: ['CPCB Authorized', 'ISO 14001', 'R2 Certified'],
    rating: 4.5,
    status: 'active',
    source: 'CPCB'
  },
  {
    name: 'E-Waste Recyclers India',
    address: 'Okhla Industrial Area, New Delhi 110020',
    location: {
      type: 'Point',
      coordinates: [77.2750, 28.5355]
    },
    capacity: 7000,
    acceptedItems: ['Computers', 'Laptops', 'Servers', 'Networking Equipment'],
    operatingHours: 'Mon-Sat: 9:30 AM - 6:30 PM',
    contactInfo: '+91-11-2691-5678',
    certifications: ['CPCB Authorized', 'ISO 14001'],
    rating: 4.3,
    status: 'active',
    source: 'CPCB'
  },

  // Mumbai facilities
  {
    name: 'Ash Recyclers',
    address: 'Mahape, Navi Mumbai, Maharashtra 400710',
    location: {
      type: 'Point',
      coordinates: [73.0297, 19.1217]
    },
    capacity: 6000,
    acceptedItems: ['All Electronics', 'White Goods', 'IT Equipment'],
    operatingHours: 'Mon-Sat: 9:00 AM - 6:00 PM',
    contactInfo: '+91-22-2778-9012',
    certifications: ['CPCB Authorized', 'ISO 14001'],
    rating: 4.4,
    status: 'active',
    source: 'CPCB'
  },
  {
    name: 'Green Enviro Management Systems',
    address: 'Andheri East, Mumbai, Maharashtra 400069',
    location: {
      type: 'Point',
      coordinates: [72.8697, 19.1136]
    },
    capacity: 5000,
    acceptedItems: ['Smartphones', 'Laptops', 'Tablets', 'Consumer Electronics'],
    operatingHours: 'Mon-Sat: 10:00 AM - 7:00 PM',
    contactInfo: '+91-22-6745-3210',
    certifications: ['CPCB Authorized'],
    rating: 4.2,
    status: 'active',
    source: 'CPCB'
  }
];

async function seedFacilities() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Check if facilities already exist
    const existingCount = await Facility.countDocuments();
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} facilities.`);
      console.log('Do you want to:');
      console.log('1. Skip seeding (default)');
      console.log('2. Add more facilities without deleting existing ones');
      console.log('3. Delete all and reseed');

      // For automated seeding, we'll just add without deleting
      console.log('Adding new facilities without deleting existing ones...');
    }

    // Insert facilities
    console.log(`Inserting ${sampleFacilities.length} facilities...`);

    for (const facilityData of sampleFacilities) {
      // Check if facility with same name already exists
      const exists = await Facility.findOne({ name: facilityData.name });
      if (exists) {
        console.log(`- Skipping "${facilityData.name}" (already exists)`);
      } else {
        await Facility.create(facilityData);
        console.log(`+ Added "${facilityData.name}"`);
      }
    }

    const finalCount = await Facility.countDocuments();
    console.log(`\nSeeding complete! Total facilities in database: ${finalCount}`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding facilities:', error);
    process.exit(1);
  }
}

// Run the seed function
seedFacilities();
