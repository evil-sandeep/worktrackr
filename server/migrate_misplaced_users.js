const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  const superadmin = await User.findOne({role: 'superadmin'});
  if (!superadmin) {
    console.log('No superadmin found');
    process.exit(1);
  }
  
  const res = await User.updateMany(
    { role: 'employee', organizationId: null },
    { $set: { organizationId: superadmin._id } }
  );
  
  console.log('Updated users:', res.modifiedCount);
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
