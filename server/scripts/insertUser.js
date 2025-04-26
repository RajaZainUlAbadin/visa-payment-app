const mongoose = require('mongoose');
const User = require('../models/User');

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/pushpay';

async function insertUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Sample user data
    const userData = {
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'Admin',
      profile: {
        bio: 'Admin'
      }
    };

    // Create new user
    const newUser = new User(userData);
    await newUser.save();

    console.log('User inserted successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error inserting user:', error);
    mongoose.connection.close();
  }
}

insertUser();