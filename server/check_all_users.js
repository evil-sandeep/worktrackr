const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

async function checkAllUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    const users = await User.find({});
    console.log('Total Users found:', users.length);
    users.forEach(u => console.log(`- ${u.name} (Role: ${u.role}, Email: ${u.email})`));
    
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

checkAllUsers();
