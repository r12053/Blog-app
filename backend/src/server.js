require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const app = require('./app');

let MONGO_URI = process.env.MONGO_URI;
console.log(process.env.MONGO_URI)
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
console.log("here we are")
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  console.log(process.env.MONGO_URI)
  mongoose.connect(MONGO_URI)
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
    });
}

module.exports = app;
