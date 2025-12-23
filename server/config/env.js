const { cleanEnv, str, port, url } = require('envalid');

// Load .env file if not in production (PM2 usually handles envs in prod, but dotenv is good for dev)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging'], default: 'development' }),
  PORT: port({ default: 4000 }),
  DATABASE_URL: url(),
  DIRECT_URL: url(),
  JWT_SECRET: str({ default: 'supersecretkey' }), // strict: true in prod
  // Add other env vars here
});

module.exports = env;
