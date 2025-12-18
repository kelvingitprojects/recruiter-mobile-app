# Database Migration: SQLite to PostgreSQL

The project has been configured to use PostgreSQL.

## Prerequisites
You need a running PostgreSQL database.
- **Option A (Docker):** If you have Docker installed, run:
  ```bash
  docker-compose up -d
  ```
- **Option B (Local Install):** Install PostgreSQL manually and create a database named `swipe`.

## Configuration
Check `server/.env` and ensure the `DATABASE_URL` matches your credentials:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/swipe"
```

## Applying Changes
Once the database is running, execute these commands in the `server` directory:

1. **Push Schema:**
   ```bash
   npx prisma db push
   ```

2. **Seed Data:**
   ```bash
   node seed.js
   ```

3. **Start Server:**
   ```bash
   npm run dev
   ```
