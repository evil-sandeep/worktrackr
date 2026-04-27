const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Organization = require('./models/Organization');

async function debugOrg() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const org = await Organization.findOne({ name: 'brovanta' });
    console.log('Full Org Object:', JSON.stringify(org, null, 2));
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

debugOrg();
