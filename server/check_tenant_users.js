const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { getTenantDb } = require('./config/tenantConnection');
const { getTenantModels } = require('./models/tenantModels');

async function checkTenantUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const dbName = 'worktrackr_org_super_admin_c8aa';
    const connection = await getTenantDb(dbName);
    const { User: TenantUser } = getTenantModels(connection);
    
    const users = await TenantUser.find({});
    console.log(`Users in tenant DB ${dbName}:`, users.length);
    users.forEach(u => console.log(`- ${u.name} (Role: ${u.role}, Email: ${u.email})`));
    
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

checkTenantUsers();
