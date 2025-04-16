require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  VISA_API_KEY: process.env.VISA_API_KEY,
  VISA_API_SECRET: process.env.VISA_API_SECRET
};