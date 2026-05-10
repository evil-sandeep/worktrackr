const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const update = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const result = await mongoose.connection.db.collection('users').updateOne(
            { email: 'test_fresh@example.com' },
            { $set: { isPaid: true } }
        );
        
        console.log('Update result:', result);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

update();
