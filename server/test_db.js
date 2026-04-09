const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const User = require('./models/User');

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        const count = await User.countDocuments({});
        console.log(`Total users in DB: ${count}`);
        const users = await User.find({}).select('name email role');
        console.log('Users:', JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();
