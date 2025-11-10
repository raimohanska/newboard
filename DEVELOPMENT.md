# Development Guide

## Quick Reference

### First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Start development (auto-starts DB and runs migrations)
npm run dev
```

Visit http://localhost:5173 to see the app!

### Daily Development

```bash
# Start everything
npm run dev
```

That's it! The database will start automatically.

## Common Commands

### Application

```bash
npm run dev          # Start frontend + backend (auto-starts DB)
npm run build        # Build frontend for production
```

### Database

```bash
npm run db:start     # Start PostgreSQL container
npm run db:stop      # Stop PostgreSQL container  
npm run db:logs      # View database logs
npm run db:psql      # Connect to database CLI
npm run db:reset     # Reset database (deletes all data!)
```

### Migrations

⚠️ **Note**: We use forward-only migrations (no down/rollback migrations).

```bash
npm run migrate               # Run pending migrations
npm run migrate:create <name> # Create new migration
npm run migrate:up            # Run pending migrations (same as migrate)
```

Examples:
```bash
# Create a new migration
npm run migrate:create add-users-table

# This creates: backend/migrations/{timestamp}_add-users-table.sql
# Edit the file with your SQL, then run:
npm run migrate:up
```

## Project Structure

```
newboard/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/     # Redux (UI state)
│   │   ├── contexts/  # React contexts
│   │   └── pages/
│   └── package.json
├── backend/           # Node.js + HocusPocus backend
│   ├── migrations/    # Database migrations (SQL)
│   ├── server.ts      # WebSocket server
│   └── package.json
├── docker-compose.yml # PostgreSQL setup
└── package.json       # Root workspace
```

## Tech Stack

- **Frontend**: React, Vite, Redux Toolkit, Y.js, Quill, React Router
- **Backend**: Node.js, HocusPocus (Y.js WebSocket server)
- **Database**: PostgreSQL 16
- **Migrations**: node-pg-migrate (SQL-based)

## Documentation

- [Docker & Database Setup](./DOCKER.md)
- [Database Migrations](./backend/MIGRATIONS.md)
- [Main README](./README.md)

## Troubleshooting

### Database won't start

```bash
# Check if container is running
docker ps

# View logs
npm run db:logs

# Reset everything
npm run db:reset
```

### Port already in use

- **5432**: PostgreSQL - stop other PostgreSQL instances
- **1234**: Backend WebSocket - check for other processes
- **5173**: Frontend Vite - check for other Vite instances

```bash
# Find process on port (macOS/Linux)
lsof -i :5432

# Kill process
kill -9 <PID>
```

### Migrations failed

```bash
# Check migration status
npm run db:psql
SELECT * FROM pgmigrations;

# If migration failed, the transaction was rolled back automatically
# Fix the SQL in the migration file and try again
npm run migrate:up
```

**Note**: We don't use down migrations. If you need to undo something:
- In development: manually revert DB changes and re-run
- In production: create a new migration that fixes the issue

### Fresh start (development only!)

```bash
# Delete everything and start fresh
npm run db:reset
cd backend
npm run migrate:up
```

## Tips

1. **Use the npm scripts from root**: Most commands work from the root directory
2. **Database persists**: Your data survives container restarts (unless you run `db:reset`)
3. **Migrations are additive**: Don't modify existing migrations, create new ones
4. **Local-first**: Y.js keeps data in browser localStorage as backup

## Environment Variables

Backend reads from environment (optional, has defaults):

```bash
export DATABASE_URL=postgresql://newboard:newboard_dev_password@localhost:5432/newboard
export PORT=1234
```

**Note:** Migrations run automatically on server startup.

## VSCode Tips

Recommended extensions:
- ESLint
- Prettier
- PostgreSQL (for SQL syntax highlighting)
- TypeScript

