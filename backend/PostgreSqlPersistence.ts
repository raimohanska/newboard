import { Extension, onChangePayload, onStoreDocumentPayload, onLoadDocumentPayload } from '@hocuspocus/server';
import { Pool, PoolClient } from 'pg';
import { mergeUpdates, applyUpdate } from 'yjs';
import { config } from './config.js';

export class PostgreSqlPersistence implements Extension {
  private pool: Pool;
  private pendingUpdates: Map<string, Uint8Array[]> = new Map();

  constructor() {
    this.pool = new Pool({
      connectionString: config.database.url,
    });
  }

  private async inTransaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async onLoadDocument(data: onLoadDocumentPayload): Promise<void> {
    const workspaceId = data.documentName;

    try {
      const result = await this.pool.query(
        'SELECT update FROM workspace_updates WHERE workspace_id = $1 ORDER BY created_at ASC',
        [workspaceId]
      );

      if (result.rows.length === 0) {
        console.log(`No updates found for workspace ${workspaceId}`);
        return;
      }

      // Apply each update to the document
      for (const row of result.rows) {
        const update = new Uint8Array(row.update);
        applyUpdate(data.document, update);
      }

      console.log(`Loaded and applied ${result.rows.length} updates for workspace ${workspaceId}`);
    } catch (error) {
      console.error('Failed to load document:', error);
      throw error;
    }
  }

  async onChange(data: onChangePayload): Promise<void> {
    const workspaceId = data.documentName;
    const update = data.update;

    // Collect updates in memory until onStoreDocument is called
    if (!this.pendingUpdates.has(workspaceId)) {
      this.pendingUpdates.set(workspaceId, []);
    }
    this.pendingUpdates.get(workspaceId)!.push(update);
  }

  async onStoreDocument(data: onStoreDocumentPayload): Promise<void> {
    const workspaceId = data.documentName;
    const updates = this.pendingUpdates.get(workspaceId);

    if (!updates || updates.length === 0) {
      return;
    }

    try {
      // Merge all pending updates into a single update
      const mergedUpdate = mergeUpdates(updates);

      await this.inTransaction(async (client) => {
        // Ensure workspace exists
        await client.query(
          'INSERT INTO workspaces (id) VALUES ($1) ON CONFLICT (id) DO NOTHING',
          [workspaceId]
        );

        // Save the merged update
        await client.query(
          'INSERT INTO workspace_updates (workspace_id, update) VALUES ($1, $2)',
          [workspaceId, Buffer.from(mergedUpdate)]
        );
      });

      // Clear pending updates for this workspace
      this.pendingUpdates.set(workspaceId, []);

      console.log(`Saved merged update (from ${updates.length} updates) for workspace ${workspaceId}`);
    } catch (error) {
      console.error('Failed to save updates:', error);
      throw error;
    }
  }

  async onDestroy(): Promise<void> {
    await this.pool.end();
  }
}

