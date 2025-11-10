# Database Migrations

This project uses [node-pg-migrate](https://github.com/salsita/node-pg-migrate) for database migrations.

## ⚠️ Important Policy: No Down Migrations

**We do NOT use down migrations in this project.**

- Migrations are forward-only
- Never write down migration code
- To fix a mistake, create a new migration that corrects it
- This is safer for production and prevents data loss

## Quick Start

### Create a new migration

```bash
cd backend
npm run migrate:create my-migration-name
```

This creates a new SQL file in `backend/migrations/` with a timestamp prefix.

### Run migrations

```bash
cd backend
npm run migrate:up
```

This applies all pending migrations to the database.

## Migration File Structure

Migrations are stored in `backend/migrations/` as SQL files.

Example migration file: `1762768024757_create-workspaces-table.sql`

```sql
-- Up Migration
CREATE TABLE workspaces (
  id VARCHAR(255) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

### Key Points

1. **Forward-only**: Migrations only go forward, never backward
2. **No down migrations**: We don't write rollback code
3. **File naming**: `{timestamp}_{description}.sql` (timestamp is auto-generated)
4. **Execution order**: Migrations run in timestamp order
5. **To fix mistakes**: Create a new migration that corrects the issue

## Writing Migrations

### SQL Syntax

Use standard PostgreSQL SQL. Examples:

**Create a table:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Add a column:**
```sql
ALTER TABLE users ADD COLUMN name VARCHAR(255);
```

**Create an index:**
```sql
CREATE INDEX idx_users_email ON users(email);
```

**Add constraints:**
```sql
ALTER TABLE items ADD CONSTRAINT fk_workspace 
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
```

### Best Practices

1. **One change per migration**: Keep migrations focused on a single logical change
2. **Forward-only**: Never write down migrations - if you need to undo something, create a new migration
3. **Use transactions**: Each migration runs in a transaction by default
4. **Don't modify existing migrations**: Once run, never edit a migration - create a new one instead
5. **Be explicit**: Use `IF EXISTS` and `IF NOT EXISTS` for safety
6. **Add comments**: Explain complex changes
7. **Test first**: Test migrations on development database before production

### Transaction Control

By default, each migration runs in a transaction. To disable:

```sql
-- disable-transaction

-- Your SQL here
```

This is useful for operations that can't run in a transaction (like `CREATE INDEX CONCURRENTLY`).

## Configuration

Configuration is in `backend/.node-pg-migrate.config.json`:

```json
{
  "databaseUrl": "postgresql://newboard:newboard_dev_password@localhost:5432/newboard",
  "migrationsTable": "pgmigrations",
  "dir": "migrations"
}
```

You can override with environment variables:
- `DATABASE_URL`: Database connection string
- `MIGRATIONS_DIR`: Directory for migration files

## Migration Tracking

node-pg-migrate creates a `pgmigrations` table to track which migrations have been applied:

```sql
SELECT * FROM pgmigrations ORDER BY run_on DESC;
```

## Common Workflows

### Initial Setup (new database)

```bash
# Start the database
npm run db:start

# Run all migrations
cd backend
npm run migrate:up
```

### Adding a new feature

```bash
# Create migration
cd backend
npm run migrate:create add-user-profiles

# Edit the generated file in migrations/
# Add your SQL

# Apply the migration
npm run migrate:up
```

### Fixing a mistake

If you made an error in a migration:

**Development (before committed):**
- Manually revert the changes in the database
- Edit the migration file
- Re-run `npm run migrate:up`

**Production (or after committed):**
- Create a new migration that fixes the issue
- Example: If you created wrong column, create new migration to drop it and add correct one

## Troubleshooting

### Migration failed

If a migration fails, the transaction will be rolled back automatically (no changes applied). Fix the SQL in the migration file and run again.

### Check migration status

```bash
# Connect to database
npm run db:psql

# Check applied migrations
SELECT * FROM pgmigrations;
```

### Reset everything (development only!)

```bash
# Delete all data and recreate database
npm run db:reset

# Re-run all migrations
cd backend
npm run migrate:up
```

## Production Considerations

1. **Backup first**: Always backup production databases before migrating
2. **Test migrations**: Test on staging environment first
3. **Monitor performance**: Some migrations (like adding indexes) can be slow
4. **Use concurrent indexes**: For large tables, use `CREATE INDEX CONCURRENTLY`
5. **Plan downtime**: Some changes may require downtime
6. **No rollbacks**: We don't use down migrations - plan carefully and test thoroughly
7. **Forward fixes only**: If something goes wrong, create a new migration to fix it

## Examples

See `backend/migrations/` for example migrations.

