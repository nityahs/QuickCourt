import mongoose from 'mongoose';
export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI missing');
  const dbName = process.env.MONGO_DBNAME; // optional override
  if (dbName) {
    await mongoose.connect(uri, { dbName });
  } else {
    await mongoose.connect(uri);
  }
  const info = mongoose.connection;
  console.log(`Mongo connected: host=${info.host} db=${info.name}`);
};