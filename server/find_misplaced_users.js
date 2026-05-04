const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Organization = require('./models/Organization');

async function findMisplacedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    // Find employees in the Main DB who have an organizationId
    const misplacedUsers = await User.find({ 
      role: 'employee', 
      organizationId: { $ne: null } 
    });
    
    console.log(`Found ${misplacedUsers.length} employees in the Main DB with an organizationId.`);
    
    for (const user of misplacedUsers) {
      const org = await Organization.findById(user.organizationId);
      console.log(`- User: ${user.name} (${user.email}) -> Org: ${org ? org.name : 'Unknown'}`);
    }
    
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

findMisplacedUsers();
