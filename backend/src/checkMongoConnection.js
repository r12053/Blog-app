require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Try to get MONGO_URI from env or config/default.json
let MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  try {
    const configPath = path.join(__dirname, '../config/default.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    MONGO_URI = config.MONGO_URI;
  } catch (err) {
    console.error('Could not read config/default.json:', err);
    process.exit(1);
  }
}

if (!MONGO_URI) {
  console.error('No MongoDB URI found in environment or config.');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connection successful!');
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
