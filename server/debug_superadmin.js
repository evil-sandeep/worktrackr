const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

async function debugSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ role: 'superadmin' });
    console.log('Super Admin:', JSON.stringify(user, null, 2));
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

debugSuperAdmin();
