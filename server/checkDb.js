const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const User = require('./models/User');

const checkDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await User.countDocuments();
    const users = await User.find().select('name email role');
    
    console.log('--- DATABASE STATUS ---');
    console.log('Total Users Found:', count);
    console.log('User Details:', users);
    console.log('-----------------------');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkDb();
