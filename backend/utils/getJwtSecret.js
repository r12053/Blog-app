const fs = require('fs');
const path = require('path');

function getJwtSecret() {
  let JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    try {
      const configPath = path.join(__dirname, '../config/default.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      JWT_SECRET = config.JWT_SECRET;
    } catch (err) {
      JWT_SECRET = 'your_jwt_secret_here';
    }
  }
  return JWT_SECRET;
}

module.exports = getJwtSecret;
