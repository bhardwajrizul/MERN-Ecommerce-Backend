require('dotenv').config();
const mongoose = require('mongoose')

if (!process.env.URI_DB || !process.env.ADMIN_DB || !process.env.PASSWORD_DB) {
    console.error('Error: Missing required environment variables.');
    process.exit(1);
}

const DB = process.env.URI_DB.replace(
    '<ADMIN>',
    process.env.ADMIN_DB
).replace(
    '<PASSWORD>',
    process.env.PASSWORD_DB
)
const connectDB = async () => {
    try {
      await mongoose.connect(DB);
      console.log('MongoDB connection success ✅');
      
    } catch (err) {
      console.error('MongoDB connection Failed ❌')
      console.error(err.message);
      mongoose.connection.close()
      process.exit(1); // Exit with failure code
    }
  }
  
  module.exports = connectDB;