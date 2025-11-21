import mongoose from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
const globalForMongoose = global as unknown as {
  mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Creates a new connection to MongoDB or returns the existing cached connection.
 * This is optimized for serverless environments where connections should be reused.
 */
async function connectDB(): Promise<typeof mongoose> {
  // If we already have a cached connection, return it
  if (globalForMongoose.mongoose.conn) {
    return globalForMongoose.mongoose.conn;
  }

  // If we don't have a connection promise, create one
    if (!globalForMongoose.mongoose.promise) {
      const opts = {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000, // 10 seconds timeout
        socketTimeoutMS: 45000, // 45 seconds socket timeout
        connectTimeoutMS: 10000, // 10 seconds connection timeout
      };

      globalForMongoose.mongoose.promise = mongoose
        .connect(MONGODB_URI!, opts)
        .then((mongoose) => {
          console.log('MongoDB connected successfully');
          return mongoose;
        })
        .catch((error) => {
          console.error('MongoDB connection error:', error);
          // Log more details in development
          if (process.env.NODE_ENV === 'development') {
            console.error('Error details:', {
              name: error.name,
              message: error.message,
              code: 'code' in error ? error.code : undefined,
            });
          }
          throw error;
        });
    }

  try {
    globalForMongoose.mongoose.conn = await globalForMongoose.mongoose.promise;
  } catch (e) {
    globalForMongoose.mongoose.promise = null;
    throw e;
  }

  return globalForMongoose.mongoose.conn;
}

// Initialize the global object if it doesn't exist
if (!globalForMongoose.mongoose) {
  globalForMongoose.mongoose = { conn: null, promise: null };
}

export default connectDB;

