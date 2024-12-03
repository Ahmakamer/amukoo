const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const logger = require('../server/logger');
const { users } = require('./schema');

const connectionString = process.env.DATABASE_URL;

// Log the connection attempt
logger.info('Attempting to connect to database:', {
  connectionString: connectionString?.replace(/:[^:@]*@/, ':***@') // Hide password in logs
});

const client = postgres(connectionString, { 
  max: 1,
  ssl: process.env.NODE_ENV === 'production'
});

const db = drizzle(client);

// Test the connection and check users table
async function testConnection() {
  try {
    await client.query('SELECT NOW()');
    logger.info('Database connection successful');

    // Check if users table exists and has records
    const result = await db.select().from(users);
    logger.info('Users table check:', {
      recordCount: result.length,
      sampleUser: result[0] ? {
        id: result[0].id,
        username: result[0].username,
        email: result[0].email
      } : null
    });
  } catch (error) {
    logger.error('Database error:', error);
    throw error;
  }
}

testConnection();

module.exports = { db };
