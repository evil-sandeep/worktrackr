const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { getTenantDb } = require('./config/tenantConnection');
const { getTenantModels } = require('./models/tenantModels');
const MainUser = require('./models/User');

async function migrateUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const dbName = 'worktrackr_org_super_admin_c8aa';
    const connection = await getTenantDb(dbName);
    const { User: TenantUser } = getTenantModels(connection);
    
    const orgAdmins = await TenantUser.find({ role: 'orgadmin' });
    console.log(`Found ${orgAdmins.length} orgadmins in tenant DB ${dbName}`);
    
    for (const user of orgAdmins) {
      const exists = await MainUser.findOne({ email: user.email });
      if (!exists) {
        console.log(`Migrating ${user.name} to main DB...`);
        const userData = user.toObject();
        delete userData._id; // Let it generate a new ID or keep it? Better keep it to avoid broken refs.
        // Wait, if I keep _id, I must ensure it doesn't conflict.
        await MainUser.create(user.toObject());
        console.log(`Successfully migrated ${user.name}`);
      } else {
        console.log(`${user.name} already exists in main DB.`);
      }
    }
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

migrateUsers();
