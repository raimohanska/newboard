import { Server } from '@hocuspocus/server';
import { runner } from 'node-pg-migrate';
import { config } from './config.js';
import { PostgreSqlPersistence } from './PostgreSqlPersistence.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    await runner({
      databaseUrl: config.database.url,
      migrationsTable: 'pgmigrations',
      dir: join(__dirname, 'migrations'),
      direction: 'up',
      verbose: true,
    });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

async function startServer() {
  await runMigrations();

  const server = Server.configure({
    port: config.server.port,

    extensions: [
      new PostgreSqlPersistence(),
    ],
    
    onConnect: async () => {
      console.log('Client connected');
    },
    
    onDisconnect: async () => {
      console.log('Client disconnected');
    },
  });

  server.listen();

  console.log(`HocusPocus server running on ws://localhost:${config.server.port}`);
}

startServer().catch(console.error);

