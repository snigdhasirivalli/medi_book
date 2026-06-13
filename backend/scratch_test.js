require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const test = async () => {
    try {
        console.log('Connecting to database...');
        let conn;
        try {
            conn = await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 });
        } catch (err) {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            conn = await mongoose.connect(uri);
        }
        console.log('Connected!');

        const email = 'testpatient@medibook.com';
        console.log(`Searching for user: ${email}...`);
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found!');
        } else {
            console.log('User found:', {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isActive: user.isActive,
                passwordHash: user.password
            });
            const matchesPatient123 = await user.matchPassword('Patient@123');
            console.log('Does password Patient@123 match?:', matchesPatient123);
        }

        await mongoose.disconnect();
        console.log('Done!');
    } catch (err) {
        console.error('Error running test:', err);
    }
};

test();
