const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Organization = require('./models/Organization');

async function checkOrgs() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    const users = await User.find({ role: 'orgadmin' });
    console.log('Org Admins found:', users.length);
    users.forEach(u => console.log(`- ${u.name} (ID: ${u._id}, OrgID: ${u.organizationId})`));
    
    const orgs = await Organization.find({});
    console.log('\nOrganizations found:', orgs.length);
    orgs.forEach(o => console.log(`- ${o.name} (ID: ${o._id})`));
    
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

checkOrgs();
