
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function main() {
  console.log('Testing pg driver connection...');
  console.log('URL:', process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@')); // Hide password
  try {
    await client.connect();
    console.log('Successfully connected with pg driver!');
    const res = await client.query('SELECT count(*) FROM "User"');
    console.log('User count:', res.rows[0].count);
    await client.end();
  } catch (e) {
    console.error('pg driver connection failed:', e);
  }
}

require('dotenv').config();
main();
