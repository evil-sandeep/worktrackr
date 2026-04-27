const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

async function findUserByEmail() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'brovanta@gmail.com' });
    console.log('User found:', JSON.stringify(user, null, 2));
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

findUserByEmail();
