const mongoose = require('mongoose');
const { seedData } = require('../utils/seeder');

const connectDB = async () => {
  try {
    let conn;
    try {
      console.log('Attempting to connect to MongoDB...');
      conn = await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
      console.log('⚠️ Local MongoDB connection failed. Starting MongoMemoryServer as fallback...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      conn = await mongoose.connect(uri);
      console.log(`MongoDB Connected (In-Memory Fallback): ${conn.connection.host}`);
    }

    // Auto-seed data on startup if database is empty
    await seedData();
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
