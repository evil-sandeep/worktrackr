const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Organization = require('./models/Organization');
const { getTenantDb } = require('./config/tenantConnection');
const { getTenantModels } = require('./models/tenantModels');

async function migrateMisplacedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    // 1. Find employees in the Main DB who have an organizationId
    const misplacedUsers = await User.find({ 
      role: 'employee', 
      organizationId: { $ne: null } 
    });
    
    console.log(`Found ${misplacedUsers.length} misplaced employees in the Main DB.`);
    
    for (const mainUser of misplacedUsers) {
      console.log(`\nProcessing User: ${mainUser.name} (${mainUser.email})`);
      
      const org = await Organization.findById(mainUser.organizationId);
      if (!org) {
        console.warn(`- Skipping: Organization not found for ID ${mainUser.organizationId}`);
        continue;
      }

      // Find the orgadmin to get their dbName
      const adminUser = await User.findOne({ organizationId: org._id, role: 'orgadmin' });
      if (!adminUser || !adminUser.dbName) {
        console.warn(`- Skipping: No admin/dbName found for organization ${org.name}`);
        continue;
      }

      const targetDbName = adminUser.dbName;
      console.log(`- Target Tenant DB: ${targetDbName}`);

      try {
        const connection = await getTenantDb(targetDbName);
        const { User: TenantUser } = getTenantModels(connection);

        // Check if user already exists in Tenant DB
        const existingTenantUser = await TenantUser.findOne({ email: mainUser.email });
        
        if (existingTenantUser) {
          console.log(`- User already exists in Tenant DB. Removing from Main DB...`);
        } else {
          console.log(`- Moving user to Tenant DB...`);
          const userData = mainUser.toObject();
          delete userData._id; // Let Mongo generate a new ID or use the same one? 
          // Keeping the same ID is safer for references, but we must ensure it's not present or it will error if we use create.
          // Actually, let's use the same ID.
          await TenantUser.create(mainUser.toObject());
          console.log(`- User successfully moved.`);
        }

        // Remove from Main DB
        await User.deleteOne({ _id: mainUser._id });
        console.log(`- User removed from Main DB.`);

      } catch (tenantErr) {
        console.error(`- Error migrating user to ${targetDbName}:`, tenantErr.message);
      }
    }
    
    console.log('\nMigration complete.');
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

migrateMisplacedUsers();
