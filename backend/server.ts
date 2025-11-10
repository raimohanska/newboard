import { Server } from '@hocuspocus/server';
import { runner } from 'node-pg-migrate';
import express from 'express';
import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
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

  // Setup Express app
  const app = express();
  const httpServer = createServer(app);

  // Serve static frontend files
  const frontendDistPath = join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendDistPath));

  // SPA fallback - serve index.html for all other routes
  app.use((req, res) => {
    res.sendFile(join(frontendDistPath, 'index.html'));
  });

  // Start HTTP server
  httpServer.listen(config.server.port, () => {
    console.log(`Server running on http://localhost:${config.server.port}`);
    console.log(`WebSocket on ws://localhost:${config.server.port}`);
  });

  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer });

  // Setup HocusPocus
  const hocuspocusServer = Server.configure({
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

  // Handle WebSocket connections
  wss.on('connection', (ws, request) => {
    hocuspocusServer.handleConnection(ws, request);
  });
}

startServer().catch(console.error);

