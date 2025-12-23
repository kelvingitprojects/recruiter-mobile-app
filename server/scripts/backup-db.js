const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');

const backupDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const date = new Date().toISOString().replace(/[:.]/g, '-');
const filename = `backup-${date}.sql`;
const filepath = path.join(backupDir, filename);

const dbUrl = env.DATABASE_URL;

if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

// Mask password in logs
console.log(`Backing up to ${filepath}...`);

// Note: This requires pg_dump to be installed on the system
const command = `pg_dump "${dbUrl}" -f "${filepath}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Backup failed: ${error.message}`);
    console.error('Ensure pg_dump is installed and in your PATH.');
    return;
  }
  if (stderr) {
    // pg_dump writes to stderr for progress, so we log it as info/warn
    console.warn(`pg_dump output: ${stderr}`);
  }
  console.log(`Backup completed successfully: ${filepath}`);
});
