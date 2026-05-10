# Quick Backend Setup Guide

## If you haven't created the backend yet, follow these steps:

### 1. Create Backend Folder

```powershell
cd "C:\Users\Administrator\Desktop\All code\smart-zambia"
mkdir smart-zambia-backend
cd smart-zambia-backend
```

### 2. Initialize Node.js Project

```powershell
npm init -y
```

### 3. Install Dependencies

```powershell
npm i express pg dotenv cors bcrypt jsonwebtoken helmet morgan zod
npm i -D nodemon
```

### 4. Create Folder Structure

```powershell
mkdir src
mkdir src\db
mkdir src\middleware
mkdir src\routes
mkdir src\utils
mkdir scripts
```

### 5. Update package.json

Open `package.json` and add:

```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }
}
```

### 6. Create .env File

Create `.env` file with:

```env
PORT=3001
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@127.0.0.1:5433/smart_zambia
JWT_SECRET=super-secret-jwt-key-change-this-in-production-12345
CORS_ORIGIN=http://localhost:8000,http://127.0.0.1:8000
```

**IMPORTANT**: Replace `YOUR_PASSWORD` with your actual PostgreSQL password!

### 7. Create Database

```powershell
# Connect to PostgreSQL
psql -h 127.0.0.1 -p 5433 -U postgres

# In psql prompt:
CREATE DATABASE smart_zambia;
\q
```

### 8. I'll Create All Backend Files for You

Let me know if you need me to create all the backend files (pool.js, server.js, routes, etc.)

## Quick Test

After setup, test if backend is running:

```powershell
# In backend folder
npm run dev
```

Then open browser:
```
http://localhost:3001/api/health
```

Should return: `{"ok":true}`

## Common Issues

### "Cannot find module"
- Run `npm install` again
- Check `package.json` has `"type": "module"`

### "Database connection error"
- Check PostgreSQL is running
- Check password in `.env` is correct
- Check database exists: `psql -h 127.0.0.1 -p 5433 -U postgres -l`

### "Port 3001 already in use"
- Kill the process: `netstat -ano | findstr :3001`
- Then: `taskkill /PID <PID> /F`

### "CORS error"
- Check CORS_ORIGIN in `.env` includes your frontend URL
- Restart backend after changing `.env`

## smart-zambia-api maintenance

When working on **`smart-zambia-api/`** rather than greenfield scaffolding, use the focused checklist in **`smart-zambia-api/API_SMOKE_CHECKLIST.md`** for Postgres migrations, env vars (`JWT_SECRET`, `DB_*`), and regression HTTP curls.
