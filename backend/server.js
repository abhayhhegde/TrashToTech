const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Define the recycling schema
const recyclingSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  weight: { type: Number, required: true },
  age: { type: Number, required: true },
  condition: { type: String, required: true },
  points: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

// Create a model from the schema
const RecyclingItem = mongoose.model('RecyclingItem', recyclingSchema);

// User registration route
app.post('/register', async (req, res) => {
  const { username, password, email, phone } = req.body;

  if (!username || !password || !email || !phone) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Ensure email uniqueness
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists.' });
    }

    // Insert the user directly
    await usersCollection.insertOne({
      username,
      password, // No encryption
      email,
      phone,
    });

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'An error occurred during registration.' });
  }
});

// User login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body; // Changed from username to email

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Lookup user by email
    const user = await usersCollection.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Send back token and email
    const token = process.env.SECRET; // Token generation logic here
    res.status(200).json({ token, email: user.email });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
});

// Helper function to calculate points
const calculatePoints = (weight) => {
  return weight * 10; // Adjustable scaling factor
};

// Recycling route
app.post('/recyclepage', async (req, res) => {
  const { email, itemName, category, weight, age, condition } = req.body;

  if (!email || !itemName || !category || !weight || !age || !condition) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const db = mongoose.connection.db;
    const recycleCollection = db.collection('recyclingitems');

    // Insert recycling item
    await recycleCollection.insertOne({
      email,
      itemName,
      category,
      weight: parseFloat(weight),
      age: parseInt(age, 10),
      condition,
      points: calculatePoints(parseFloat(weight)),
    });

    res.status(201).json({ message: 'Item recycled successfully!', points: calculatePoints(parseFloat(weight)) });
  } catch (error) {
    console.error('Error while recycling item:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
