/**
 * Script to test MongoDB connection
 * 
 * Usage:
 *   1. Set MONGODB_URI environment variable:
 *      export MONGODB_URI="your-connection-string"
 *      node -r ts-node/register scripts/test-db-connection.ts
 * 
 *   2. Or use with Next.js environment loading:
 *      MONGODB_URI="your-connection-string" node -r ts-node/register scripts/test-db-connection.ts
 * 
 *   3. Or create a simple test API endpoint and call it
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  console.log('Testing MongoDB connection...\n');

  // Check if MONGODB_URI is set
  if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI environment variable is not set');
    console.log('\nPlease set MONGODB_URI in your .env.local file');
    process.exit(1);
  }

  // Mask sensitive information in URI for display
  const maskedUri = MONGODB_URI.replace(
    /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
    'mongodb+srv://$1:***@'
  );
  console.log(`Connection URI: ${maskedUri}\n`);

  try {
    // Set connection timeout
    const timeout = 10000; // 10 seconds

    console.log('Attempting to connect...');
    const startTime = Date.now();

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: timeout,
      socketTimeoutMS: timeout,
    });

    const connectionTime = Date.now() - startTime;
    console.log(`✅ Connected successfully (${connectionTime}ms)\n`);

    // Check connection state
    const readyState = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    console.log(`Connection state: ${states[readyState]} (${readyState})\n`);

    // Perform ping test
    console.log('Performing ping test...');
    const pingStartTime = Date.now();
    await mongoose.connection.db.admin().ping();
    const pingTime = Date.now() - pingStartTime;
    console.log(`✅ Ping successful (${pingTime}ms)\n`);

    // Get database information
    const dbName = mongoose.connection.db.databaseName;
    console.log(`Database name: ${dbName}`);

    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Collections: ${collections.length}`);
    if (collections.length > 0) {
      console.log('  -', collections.map((c) => c.name).join(', '));
    }

    // Get server information
    const serverStatus = await mongoose.connection.db.admin().serverStatus();
    console.log(`\nMongoDB version: ${serverStatus.version}`);
    console.log(`Uptime: ${Math.floor(serverStatus.uptime / 3600)} hours`);

    console.log('\n✅ All tests passed! Database is running and accessible.\n');

    // Close connection
    await mongoose.connection.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('\n❌ Connection failed!\n');

    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);

      // Provide helpful error messages
      if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        console.error(
          '\n💡 Tip: Cannot resolve hostname. Check if your MONGODB_URI hostname is correct.'
        );
      } else if (error.message.includes('authentication failed')) {
        console.error(
          '\n💡 Tip: Authentication failed. Check your username and password in MONGODB_URI.'
        );
      } else if (error.message.includes('timeout')) {
        console.error(
          '\n💡 Tip: Connection timeout. The database server may be unreachable or your network may be blocking the connection.'
        );
      } else if (error.message.includes('IP')) {
        console.error(
          '\n💡 Tip: IP address not whitelisted. Add your IP address to MongoDB Atlas network access list.'
        );
      }
    } else {
      console.error('Unknown error:', error);
    }

    process.exit(1);
  }
}

// Run the test
testConnection().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});

