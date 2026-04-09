const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existing = await User.findOne({ email: 'admin@worktrackr.com' });
    if (existing) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@worktrackr.com',
      phone: '9999999999',
      empId: 'ADMIN001',
      password: 'Admin@123',
      role: 'admin',
      designation: 'System Administrator',
    });

    console.log('✅ Admin user created successfully!');
    console.log('─────────────────────────────');
    console.log('Email:    admin@worktrackr.com');
    console.log('Password: Admin@123');
    console.log('Emp ID:   ADMIN001');
    console.log('─────────────────────────────');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
