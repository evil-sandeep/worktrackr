const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  
  // Get all orgadmins
  const admins = await User.find({ role: { $in: ['orgadmin', 'admin'] } });
  
  for (const admin of admins) {
    if (!admin.organizationId || !admin.dbName) continue;
    
    const { getTenantDb } = require('./config/tenantConnection');
    const conn = await getTenantDb(admin.dbName);
    const TenantUser = conn.model('User', User.schema);
    
    // Find employees using org._id instead of admin._id
    const wrongOrgEmployees = await TenantUser.find({
      role: 'employee',
      organizationId: admin.organizationId  // org._id (wrong)
    });
    
    if (wrongOrgEmployees.length > 0) {
      console.log(`Found ${wrongOrgEmployees.length} mislinked employees under org ${admin.name}. Fixing...`);
      const result = await TenantUser.updateMany(
        { role: 'employee', organizationId: admin.organizationId },
        { $set: { organizationId: admin._id } }
      );
      console.log(`Fixed ${result.modifiedCount} employees.`);
    } else {
      console.log(`No mislinked employees under org ${admin.name}.`);
    }
  }
  
  console.log('Done!');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
