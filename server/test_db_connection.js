const { Client } = require('pg');

const passwords = ['password', 'postgres', 'admin', 'root', '123456'];
const user = 'postgres';

async function testConnection() {
  for (const password of passwords) {
    console.log(`Testing password: '${password}'...`);
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres', // Try connecting to default db first
      password: password,
      port: 5432,
    });

    try {
      await client.connect();
      console.log(`✅ Success! Valid credentials: postgres:${password}`);
      await client.end();
      return password;
    } catch (err) {
      console.log(`❌ Failed: ${err.message}`);
      await client.end();
    }
  }
  return null;
}

testConnection().then(validPassword => {
  if (validPassword) {
    console.log(`FOUND_PASSWORD:${validPassword}`);
  } else {
    console.log('NO_VALID_PASSWORD_FOUND');
  }
});
