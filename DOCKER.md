# Docker Development Setup

## PostgreSQL Database

This project uses PostgreSQL for data persistence. A Docker Compose configuration is provided for easy local development.

### Prerequisites

- Docker
- Docker Compose

### Integrated Development Setup

The database is automatically started when you run:

```bash
npm run dev
```

This single command will:
1. Start the PostgreSQL container
2. Wait for it to be healthy
3. Start both frontend and backend servers

### Manual Database Management

If you need to manage the database separately:

1. **Start the PostgreSQL container:**

```bash
npm run db:start
# or
docker-compose up -d
```

2. **Check the container is running:**

```bash
docker-compose ps
```

3. **View logs:**

```bash
npm run db:logs
# or
docker-compose logs -f postgres
```

4. **Stop the container:**

```bash
npm run db:stop
# or
docker-compose down
```

5. **Stop and remove all data:**

```bash
npm run db:reset
# or
docker-compose down -v
```

### Database Connection Details

- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `newboard`
- **User:** `newboard`
- **Password:** `newboard_dev_password`

**Connection String:**
```
postgresql://newboard:newboard_dev_password@localhost:5432/newboard
```

### Accessing the Database

**Using psql (inside the container):**

```bash
docker-compose exec postgres psql -U newboard -d newboard
```

**Using psql (from host, if installed):**

```bash
psql -h localhost -U newboard -d newboard
```

### Useful Commands

```bash
# Start database (recommended - uses npm scripts)
npm run db:start

# View database logs
npm run db:logs

# Stop database
npm run db:stop

# Reset database (deletes all data)
npm run db:reset

# Connect to PostgreSQL CLI
npm run db:psql

# Alternative: Direct docker-compose commands
docker-compose up -d          # Start services
docker-compose logs -f        # View logs
docker-compose restart postgres  # Restart PostgreSQL
docker-compose down           # Stop services
docker-compose down -v        # Remove volumes (deletes all data)
docker-compose ps             # Check health status
```

### Data Persistence

Database data is stored in a Docker volume named `newboard_postgres_data`. This volume persists even when containers are stopped or removed (unless you use `docker-compose down -v`).

## Production Docker Deployment

The application can be fully containerized for production using Docker.

### Quick Production Start

```bash
# 1. Set environment variables
export POSTGRES_PASSWORD=your-secure-password
export PORT=1234

# 2. Build and start all services
npm run docker:prod

# 3. Check logs
docker-compose -f docker-compose.prod.yml logs -f

# 4. Stop services
npm run docker:prod:down
```

### Production Docker Commands

```bash
# Build image
npm run docker:build

# Start with Docker Compose (includes PostgreSQL)
npm run docker:prod

# Stop services
npm run docker:prod:down

# Run standalone (requires external database)
npm run docker:run
```

### Production Architecture

When running with `docker-compose.prod.yml`:
- **app** container: Node.js server (frontend + backend + WebSocket)
- **postgres** container: PostgreSQL database
- Isolated network: `newboard-network`
- Persistent volume: `postgres_data_prod`

### Environment Variables

Required for production:
- `POSTGRES_PASSWORD`: PostgreSQL password
- `DATABASE_URL`: Auto-computed in docker-compose, or set manually
- `PORT`: Server port (default: 1234)

### Production Notes

⚠️ **IMPORTANT:** The default credentials are for development only. In production:
- Use strong, unique passwords
- Store credentials in environment variables or secrets management
- Enable SSL connections
- Configure proper access controls
- Use connection pooling
- Set up proper backup strategy
- Monitor resource usage

