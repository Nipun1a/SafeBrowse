const mongoose = require('mongoose');

let connectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set');
  }

  connectionPromise = mongoose
    .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 1500, socketTimeoutMS: 1500 })
    .then((conn) => {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn.connection;
    })
    .finally(() => { connectionPromise = undefined; });

  return connectionPromise;
};

module.exports = connectDB;
